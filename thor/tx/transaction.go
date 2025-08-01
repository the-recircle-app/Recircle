// Copyright (c) 2018 The VeChainThor developers

// Distributed under the GNU Lesser General Public License v3.0 software license, see the accompanying
// file LICENSE or <https://www.gnu.org/licenses/lgpl-3.0.html>

package tx

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"math/big"
	"slices"
	"sync/atomic"

	"github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/crypto/secp256k1"
	"github.com/ethereum/go-ethereum/params"
	"github.com/ethereum/go-ethereum/rlp"
	"github.com/vechain/thor/v2/thor"
)

var (
	ErrTxTypeNotSupported = errors.New("transaction type not supported")

	errIntrinsicGasOverflow = errors.New("intrinsic gas overflow")
	errShortTypedTx         = errors.New("typed transaction too short")
)

type Type = byte

// Starting from 0x51 to avoid ambiguity with Ethereum tx type codes.
const (
	TypeLegacy     = Type(0x00)
	TypeDynamicFee = Type(0x51)
)

// Transaction is an immutable tx type.
type Transaction struct {
	body txData

	cache struct {
		signingHash  atomic.Value
		origin       atomic.Value
		id           atomic.Value
		unprovedWork atomic.Value
		size         atomic.Uint64
		intrinsicGas atomic.Uint64
		hash         atomic.Value
		delegator    atomic.Value
	}
}

// txData describes details of a tx.
type txData interface {
	txType() byte
	copy() txData

	chainTag() byte
	blockRef() uint64
	expiration() uint32
	clauses() []*Clause
	gas() uint64
	maxFeePerGas() *big.Int
	maxPriorityFeePerGas() *big.Int
	dependsOn() *thor.Bytes32
	nonce() uint64
	reserved() *reserved
	signature() []byte
	setSignature(sig []byte)
	signingFields() []any // signingFields returns the fields that are used to compute the signing hash.

	// Encode/decode encodes/decodes the tx body into binary format, the format is defined by the tx data itself.
	// This allows different tx types to have different encoding formats. The coding function are designed only
	// for typed txs and the type identifier is not included in the encoding.
	encode(*bytes.Buffer) error
	decode([]byte) error
}

// MarshalBinary returns the canonical encoding of the transaction.
// For legacy transactions, it returns the RLP encoding. For typed
// transactions, it returns the type RLP encoding of the tx.
func (t *Transaction) MarshalBinary() ([]byte, error) {
	if t.Type() == TypeLegacy {
		return rlp.EncodeToBytes(t.body)
	}
	var buf bytes.Buffer
	err := t.encodeTyped(&buf)
	return buf.Bytes(), err
}

// encodeTyped writes the canonical encoding of a typed transaction to w.
func (t *Transaction) encodeTyped(w *bytes.Buffer) error {
	w.WriteByte(t.Type())
	return t.body.encode(w)
}

// EncodeRLP implements rlp.Encoder
func (t *Transaction) EncodeRLP(w io.Writer) error {
	if t.Type() == TypeLegacy {
		return rlp.Encode(w, &t.body)
	}
	buf := encodeBufferPool.Get().(*bytes.Buffer)
	defer encodeBufferPool.Put(buf)
	buf.Reset()

	if err := t.encodeTyped(buf); err != nil {
		return err
	}

	return rlp.Encode(w, buf.Bytes())
}

// UnmarshalBinary decodes the canonical encoding of transactions.
// It supports legacy RLP transactions and typed transactions.
func (t *Transaction) UnmarshalBinary(b []byte) error {
	if len(b) > 0 && b[0] > 0x7f {
		// It's a legacy transaction.
		var data legacyTransaction
		if err := rlp.DecodeBytes(b, &data); err != nil {
			return err
		}
		t.setDecoded(&data, uint64(len(b)))
		return nil
	}
	// It's a typed transaction envelope.
	body, err := t.decodeTyped(b)
	if err != nil {
		return err
	}
	t.setDecoded(body, uint64(len(b)))
	return nil
}

// decodeTyped decodes a typed transaction from the canonical format.
func (t *Transaction) decodeTyped(b []byte) (txData, error) {
	if len(b) <= 1 {
		return nil, errShortTypedTx
	}
	switch b[0] {
	case TypeDynamicFee:
		var body dynamicFeeTransaction
		err := body.decode(b[1:])
		return &body, err
	default:
		return nil, ErrTxTypeNotSupported
	}
}

// setDecoded sets the inner transaction body and size after decoding.
func (t *Transaction) setDecoded(body txData, size uint64) {
	t.body = body
	if size > 0 {
		t.cache.size.Store(size)
	}
}

// DecodeRLP implements rlp.Decoder
func (t *Transaction) DecodeRLP(s *rlp.Stream) error {
	kind, size, err := s.Kind()

	switch {
	case err != nil:
		return err
	case kind == rlp.List:
		// It's a legacy transaction.
		var body legacyTransaction
		err = s.Decode(&body)
		if err == nil {
			t.setDecoded(&body, rlp.ListSize(size))
		}

		return err
	case kind == rlp.Byte:
		return errShortTypedTx
	default:
		// It's a TX envelope.
		// First read the tx payload bytes into a temporary buffer.
		b, err := s.Bytes()
		if err != nil {
			return err
		}
		body, err := t.decodeTyped(b)
		if err == nil {
			t.setDecoded(body, uint64(len(b)))
		}
		return err
	}
}

// Size returns size in bytes when RLP encoded.
func (t *Transaction) Size() thor.StorageSize {
	if cached := t.cache.size.Load(); cached != 0 {
		return thor.StorageSize(cached)
	}

	var size thor.StorageSize
	rlp.Encode(&size, t.body)

	// For typed transactions, the encoding also includes the leading type byte.
	if t.body.txType() != TypeLegacy {
		size += 1
	}

	t.cache.size.Store(uint64(size))
	return size
}

// Type returns the transaction type.
func (t *Transaction) Type() uint8 {
	return t.body.txType()
}

// ChainTag returns chain tag.
func (t *Transaction) ChainTag() byte {
	return t.body.chainTag()
}

// Nonce returns nonce value.
func (t *Transaction) Nonce() uint64 {
	return t.body.nonce()
}

// BlockRef returns block reference, which is first 8 bytes of block hash.
func (t *Transaction) BlockRef() (br BlockRef) {
	binary.BigEndian.PutUint64(br[:], t.body.blockRef())
	return
}

// Expiration returns expiration in unit block.
// A valid transaction requires:
// blockNum in [blockRef.Num... blockRef.Num + Expiration]
func (t *Transaction) Expiration() uint32 {
	return t.body.expiration()
}

// IsExpired returns whether the tx is expired according to the given blockNum.
func (t *Transaction) IsExpired(blockNum uint32) bool {
	return uint64(blockNum) > uint64(t.BlockRef().Number())+uint64(t.body.expiration()) // cast to uint64 to prevent potential overflow
}

// ID returns id of tx.
// ID = hash(signingHash, origin).
// It returns zero Bytes32 if origin not available.
func (t *Transaction) ID() (id thor.Bytes32) {
	if cached := t.cache.id.Load(); cached != nil {
		return cached.(thor.Bytes32)
	}
	defer func() { t.cache.id.Store(id) }()

	origin, err := t.Origin()
	if err != nil {
		return
	}
	return thor.Blake2b(t.SigningHash().Bytes(), origin[:])
}

// Hash returns hash of tx.
// Unlike ID, it's the hash of RLP encoded tx.
func (t *Transaction) Hash() (hash thor.Bytes32) {
	if cached := t.cache.hash.Load(); cached != nil {
		return cached.(thor.Bytes32)
	}
	defer func() { t.cache.hash.Store(hash) }()

	// Legacy tx don't have type prefix.
	if t.Type() == TypeLegacy {
		return rlpHash(t.body)
	}
	return prefixedRlpHash(t.Type(), t.body)
}

// SigningHash returns hash of tx excludes signature.
func (t *Transaction) SigningHash() (hash thor.Bytes32) {
	if cached := t.cache.signingHash.Load(); cached != nil {
		return cached.(thor.Bytes32)
	}
	defer func() { t.cache.signingHash.Store(hash) }()

	if t.Type() == TypeLegacy {
		return rlpHash(t.body.signingFields())
	}
	// Include type prefix for typed tx.
	return prefixedRlpHash(t.Type(), t.body.signingFields())
}

// Gas returns gas provision for this tx.
func (t *Transaction) Gas() uint64 {
	return t.body.gas()
}

// MaxFeePerGas returns max fee per gas.
func (t *Transaction) MaxFeePerGas() *big.Int {
	return t.body.maxFeePerGas()
}

// MaxPriorityFeePerGas returns max priority fee per gas.
func (t *Transaction) MaxPriorityFeePerGas() *big.Int {
	return t.body.maxPriorityFeePerGas()
}

// Clauses returns clauses in tx.
func (t *Transaction) Clauses() []*Clause {
	return slices.Clone(t.body.clauses())
}

// DependsOn returns depended tx hash.
func (t *Transaction) DependsOn() *thor.Bytes32 {
	if t.body.dependsOn() == nil {
		return nil
	}
	cpy := *t.body.dependsOn()
	return &cpy
}

// Signature returns signature.
func (t *Transaction) Signature() []byte {
	return slices.Clone(t.body.signature())
}

// Features returns features.
func (t *Transaction) Features() Features {
	return t.body.reserved().Features
}

// Origin extract address of tx originator from signature.
func (t *Transaction) Origin() (thor.Address, error) {
	if err := t.validateSignatureLength(); err != nil {
		return thor.Address{}, err
	}

	if cached := t.cache.origin.Load(); cached != nil {
		return cached.(thor.Address), nil
	}

	pub, err := crypto.SigToPub(t.SigningHash().Bytes(), t.body.signature()[:65])
	if err != nil {
		return thor.Address{}, err
	}
	origin := thor.Address(crypto.PubkeyToAddress(*pub))
	t.cache.origin.Store(origin)
	return origin, nil
}

// DelegatorSigningHash returns hash of tx components for delegator to sign, by assuming originator address.
// According to VIP-191, it's identical to tx id.
func (t *Transaction) DelegatorSigningHash(origin thor.Address) (hash thor.Bytes32) {
	return thor.Blake2b(t.SigningHash().Bytes(), origin[:])
}

// Delegator returns delegator address who would like to pay for gas fee.
func (t *Transaction) Delegator() (*thor.Address, error) {
	if err := t.validateSignatureLength(); err != nil {
		return nil, err
	}

	if !t.Features().IsDelegated() {
		return nil, nil
	}

	if cached := t.cache.delegator.Load(); cached != nil {
		addr := cached.(thor.Address)
		return &addr, nil
	}

	origin, err := t.Origin()
	if err != nil {
		return nil, err
	}

	pub, err := crypto.SigToPub(t.DelegatorSigningHash(origin).Bytes(), t.body.signature()[65:])
	if err != nil {
		return nil, err
	}

	delegator := thor.Address(crypto.PubkeyToAddress(*pub))

	t.cache.delegator.Store(delegator)
	return &delegator, nil
}

// WithSignature create a new tx with signature set.
// For delegated tx, sig is joined with signatures of originator and delegator.
func (t *Transaction) WithSignature(sig []byte) *Transaction {
	newTx := Transaction{
		body: t.body.copy(),
	}
	// copy sig
	newTx.body.setSignature(slices.Clone(sig))
	return &newTx
}

// TestFeatures test if the tx is compatible with given supported features.
// An error returned if it is incompatible.
func (t *Transaction) TestFeatures(supported Features) error {
	r := t.body.reserved()
	if r.Features&supported != r.Features {
		return errors.New("unsupported features")
	}

	if len(r.Unused) > 0 {
		return errors.New("unused reserved slot")
	}
	return nil
}

// IntrinsicGas returns intrinsic gas of tx.
func (t *Transaction) IntrinsicGas() (uint64, error) {
	if cached := t.cache.intrinsicGas.Load(); cached != 0 {
		return cached, nil
	}

	gas, err := IntrinsicGas(t.body.clauses()...)
	if err != nil {
		return 0, err
	}
	t.cache.intrinsicGas.Store(gas)
	return gas, nil
}

// EffectiveGasPrice calculates the effective gas price of a transaction,which is the gas
// price sender have to pay per gas unit. The proved work is NOT included.For legacy
// transactions, baseGasPrice is required. For dynamic fee transactions,baseFee is required.
// It is caller's responsibility to ensure the fields are passed correctly.
func (t *Transaction) EffectiveGasPrice(baseFee *big.Int, legacyTxBaseGasPrice *big.Int) *big.Int {
	// For legacy transactions, the gas price is fixed and determined at transaction creation time.
	if t.Type() == TypeLegacy {
		return t.body.(*legacyTransaction).gasPrice(legacyTxBaseGasPrice)
	}

	// For dynamic fee transactions, effective gas price take block base fee into account.
	// Which is MIN(maxFeePerGas, maxPriorityFeePerGas + baseFee)
	return math.BigMin(t.body.maxFeePerGas(), t.body.maxPriorityFeePerGas().Add(t.body.maxPriorityFeePerGas(), baseFee))
}

// EffectivePriorityFeePerGas returns the effective priority fee per gas for the transaction. If maxFeePerGas is less than
// baseFee, an error is returned. For legacy transactions, the overall gas price which includes the proved work is used as both
// maxPriorityFeePerGas and maxFeePerGas.
// It is caller's responsibility to ensure the fields are passed correctly.
func (t *Transaction) EffectivePriorityFeePerGas(baseFee *big.Int, legacyTxBaseGasPrice *big.Int, provedWork *big.Int) *big.Int {
	var (
		maxPriorityFeePerGas *big.Int
		maxFeePerGas         *big.Int
	)

	if t.Type() == TypeLegacy {
		overallGasPrice := t.OverallGasPrice(legacyTxBaseGasPrice, provedWork)
		maxPriorityFeePerGas = overallGasPrice
		maxFeePerGas = overallGasPrice
	} else {
		maxPriorityFeePerGas = t.body.maxPriorityFeePerGas()
		maxFeePerGas = t.body.maxFeePerGas()
	}

	priorityFeePerGas := new(big.Int).Sub(maxFeePerGas, baseFee)
	return math.BigMin(priorityFeePerGas, maxPriorityFeePerGas)
}

// GasPriceCoef returns gas price coef.
// gas price = bgp + bgp * gpc / 255.
//
// NOTE: This method only works for legacy transactions.
func (t *Transaction) GasPriceCoef() uint8 {
	if t.Type() != TypeLegacy {
		return 0
	}
	return t.body.(*legacyTransaction).gasPriceCoef()
}

// ProvedWork returns proved work for legacy transactions.
// Unproved work will be considered as proved work if block ref is the prefix
// of a block's ID, and tx delay is less equal to MaxTxWorkDelay.
//
// NOTE: This method only works for legacy transactions.
func (t *Transaction) ProvedWork(headBlockNum uint32, getBlockID func(uint32) (thor.Bytes32, error)) (*big.Int, error) {
	if t.Type() != TypeLegacy {
		return &big.Int{}, nil
	}

	ref := t.BlockRef()
	refNum := ref.Number()
	if refNum >= headBlockNum {
		return &big.Int{}, nil
	}

	if delay := headBlockNum - refNum; delay > thor.MaxTxWorkDelay {
		return &big.Int{}, nil
	}

	id, err := getBlockID(refNum)
	if err != nil {
		return nil, err
	}
	if bytes.HasPrefix(id[:], ref[:]) {
		return t.UnprovedWork(), nil
	}
	return &big.Int{}, nil
}

// UnprovedWork returns unproved work for legacy transactions.
// It returns 0, if tx is not signed or not a legacy transaction.
//
// NOTE: This method only works for legacy transactions.
func (t *Transaction) UnprovedWork() *big.Int {
	if t.Type() != TypeLegacy {
		return &big.Int{}
	}

	if cached := t.cache.unprovedWork.Load(); cached != nil {
		return cached.(*big.Int)
	}

	origin, err := t.Origin()
	if err != nil {
		return &big.Int{}
	}

	w := t.EvaluateWork(origin)(t.body.nonce())
	t.cache.unprovedWork.Store(w)
	return w
}

// OverallGasPrice calculate overall gas price which includes proved work for legacy transactions.
// overallGasPrice = gasPrice + baseGasPrice * wgas/gas.
//
// NOTE: This method only works for legacy transactions.
func (t *Transaction) OverallGasPrice(legacyTxBaseGasPrice *big.Int, provedWork *big.Int) *big.Int {
	if t.Type() != TypeLegacy {
		return t.body.maxFeePerGas()
	}

	gasPrice := t.body.(*legacyTransaction).gasPrice(legacyTxBaseGasPrice)
	if provedWork.Sign() == 0 {
		return gasPrice
	}

	wgas := workToGas(provedWork, t.BlockRef().Number())
	if wgas == 0 {
		return gasPrice
	}
	if wgas > t.body.gas() {
		wgas = t.body.gas()
	}

	x := new(big.Int).SetUint64(wgas)
	x.Mul(x, legacyTxBaseGasPrice)
	// division by zero cannot happen here because of the intrinsic gas pre-check which ensures that tx gas is always
	// greater than 0
	x.Div(x, new(big.Int).SetUint64(t.body.gas()))
	return x.Add(x, gasPrice)
}

// EvaluateWork try to compute work when tx origin assumed. This is mostly used for a
// client trying to gain higher priority in the mempool for the legacy transactions.
//
// NOTE: This method only works for legacy transactions.
func (t *Transaction) EvaluateWork(origin thor.Address) func(nonce uint64) *big.Int {
	if t.Type() != TypeLegacy {
		return func(nonce uint64) *big.Int {
			return &big.Int{}
		}
	}

	return t.body.(*legacyTransaction).evaluateWork(origin)
}

func (t *Transaction) String() string {
	var (
		originStr    = "N/A"
		br           BlockRef
		dependsOn    = "nil"
		delegatorStr = "N/A"
	)
	if origin, err := t.Origin(); err == nil {
		originStr = origin.String()
	}
	if delegator, _ := t.Delegator(); delegator != nil {
		delegatorStr = delegator.String()
	}

	binary.BigEndian.PutUint64(br[:], t.body.blockRef())
	if t.body.dependsOn() != nil {
		dependsOn = t.body.dependsOn().String()
	}

	s := fmt.Sprintf(`
	Tx(%v, %v)
	Origin:         %v
	Clauses:        %v
	Gas:            %v
	ChainTag:       %v
	BlockRef:       %v-%x
	Expiration:     %v
	DependsOn:      %v
	Nonce:          %v
	UnprovedWork:   %v
	Delegator:      %v
	Signature:      0x%x
`, t.ID(), t.Size(), originStr, t.body.clauses(), t.body.gas(),
		t.body.chainTag(), br.Number(), br[4:], t.body.expiration(), dependsOn, t.body.nonce(), t.UnprovedWork(), delegatorStr, t.body.signature())

	if t.Type() == TypeLegacy {
		return fmt.Sprintf(`%v
		GasPriceCoef:   %v
		`, s, t.body.(*legacyTransaction).gasPriceCoef())
	}

	return fmt.Sprintf(`%v
		MaxFeePerGas:   %v
		MaxPriorityFeePerGas: %v
		`, s, t.body.maxFeePerGas(), t.body.maxPriorityFeePerGas())
}

func (t *Transaction) validateSignatureLength() error {
	expectedSigLen := 65
	if t.Features().IsDelegated() {
		expectedSigLen *= 2
	}

	if len(t.body.signature()) != expectedSigLen {
		return secp256k1.ErrInvalidSignatureLen
	}
	return nil
}

// IntrinsicGas calculate intrinsic gas cost for tx with such clauses.
func IntrinsicGas(clauses ...*Clause) (uint64, error) {
	if len(clauses) == 0 {
		return thor.TxGas + thor.ClauseGas, nil
	}

	var total = thor.TxGas
	var overflow bool
	for _, c := range clauses {
		gas, err := dataGas(c.body.Data)
		if err != nil {
			return 0, err
		}
		total, overflow = math.SafeAdd(total, gas)
		if overflow {
			return 0, errIntrinsicGasOverflow
		}

		var cgas uint64
		if c.IsCreatingContract() {
			// contract creation
			cgas = thor.ClauseGasContractCreation
		} else {
			cgas = thor.ClauseGas
		}

		total, overflow = math.SafeAdd(total, cgas)
		if overflow {
			return 0, errIntrinsicGasOverflow
		}
	}
	return total, nil
}

// see core.IntrinsicGas
func dataGas(data []byte) (uint64, error) {
	if len(data) == 0 {
		return 0, nil
	}
	var z, nz uint64
	for _, byt := range data {
		if byt == 0 {
			z++
		} else {
			nz++
		}
	}
	zgas, overflow := math.SafeMul(params.TxDataZeroGas, z)
	if overflow {
		return 0, errIntrinsicGasOverflow
	}
	nzgas, overflow := math.SafeMul(params.TxDataNonZeroGas, nz)
	if overflow {
		return 0, errIntrinsicGasOverflow
	}

	gas, overflow := math.SafeAdd(zgas, nzgas)
	if overflow {
		return 0, errIntrinsicGasOverflow
	}
	return gas, nil
}
