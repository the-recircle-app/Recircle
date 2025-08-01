// Copyright (c) 2018 The VeChainThor developers

// Distributed under the GNU Lesser General Public License v3.0 software license, see the accompanying
// file LICENSE or <https://www.gnu.org/licenses/lgpl-3.0.html>

package runtime

import (
	"math/big"

	"github.com/pkg/errors"
	"github.com/vechain/thor/v2/builtin"
	"github.com/vechain/thor/v2/state"
	"github.com/vechain/thor/v2/thor"
	"github.com/vechain/thor/v2/tx"
	"github.com/vechain/thor/v2/xenv"
)

// ResolvedTransaction resolve the transaction according to given state.
type ResolvedTransaction struct {
	tx           *tx.Transaction
	Origin       thor.Address
	Delegator    *thor.Address
	IntrinsicGas uint64
	Clauses      []*tx.Clause
}

// ResolveTransaction resolves the transaction and performs basic validation.
func ResolveTransaction(trx *tx.Transaction) (*ResolvedTransaction, error) {
	origin, err := trx.Origin()
	if err != nil {
		return nil, err
	}
	intrinsicGas, err := trx.IntrinsicGas()
	if err != nil {
		return nil, err
	}
	if trx.Gas() < intrinsicGas {
		return nil, errors.New("intrinsic gas exceeds provided gas")
	}
	delegator, err := trx.Delegator()
	if err != nil {
		return nil, err
	}

	clauses := trx.Clauses()
	sumValue := new(big.Int)
	for _, clause := range clauses {
		value := clause.Value()
		if value.Sign() < 0 {
			return nil, errors.New("clause with negative value")
		}

		sumValue.Add(sumValue, value)
		if sumValue.BitLen() > 256 {
			return nil, errors.New("tx value too large")
		}
	}

	if trx.Type() != tx.TypeLegacy {
		if trx.MaxFeePerGas().Sign() < 0 {
			return nil, errors.New("max fee per gas must be positive")
		}
		if trx.MaxPriorityFeePerGas().Sign() < 0 {
			return nil, errors.New("max priority fee per gas must be positive")
		}

		if trx.MaxFeePerGas().BitLen() > 256 {
			return nil, errors.New("max fee per gas higher than 2^256-1")
		}
		if trx.MaxPriorityFeePerGas().BitLen() > 256 {
			return nil, errors.New("max priority fee per gas higher than 2^256-1")
		}

		if trx.MaxFeePerGas().Cmp(trx.MaxPriorityFeePerGas()) < 0 {
			return nil, errors.New("maxFeePerGas is less than maxPriorityFeePerGas")
		}
	}

	return &ResolvedTransaction{
		trx,
		origin,
		delegator,
		intrinsicGas,
		clauses,
	}, nil
}

// CommonTo returns common 'To' field of clauses if any.
// Nil returned if no common 'To'.
func (r *ResolvedTransaction) CommonTo() *thor.Address {
	if len(r.Clauses) == 0 {
		return nil
	}

	firstTo := r.Clauses[0].To()
	if firstTo == nil {
		return nil
	}

	for _, clause := range r.Clauses[1:] {
		to := clause.To()
		if to == nil {
			return nil
		}
		if *to != *firstTo {
			return nil
		}
	}
	return firstTo
}

// BuyGas consumes energy to buy gas, to prepare for execution.
func (r *ResolvedTransaction) BuyGas(state *state.State, blockTime uint64, baseFee *big.Int) (
	legacyTxBaseGasPrice *big.Int,
	effectiveGasPrice *big.Int,
	payer thor.Address,
	prepaid *big.Int,
	returnGas func(uint64) error,
	err error,
) {
	if legacyTxBaseGasPrice, err = builtin.Params.Native(state).Get(thor.KeyLegacyTxBaseGasPrice); err != nil {
		return
	}
	effectiveGasPrice = r.tx.EffectiveGasPrice(baseFee, legacyTxBaseGasPrice)

	if baseFee != nil && effectiveGasPrice.Cmp(baseFee) < 0 {
		// ensure effectiveGasPrice can cover the block baseFee in GALACTICA
		return nil, nil, thor.Address{}, nil, nil, errors.New("gas price is less than block base fee")
	}

	energy := builtin.Energy.Native(state, blockTime)
	doReturnGas := func(rgas uint64) (*big.Int, error) {
		returnedEnergy := new(big.Int).Mul(new(big.Int).SetUint64(rgas), effectiveGasPrice)
		if err := energy.Add(payer, returnedEnergy); err != nil {
			return nil, err
		}
		return returnedEnergy, nil
	}

	// prepaid is the max total of gas cost available to spend on this transaction
	prepaid = new(big.Int).Mul(new(big.Int).SetUint64(r.tx.Gas()), effectiveGasPrice)
	if r.Delegator != nil {
		var sufficient bool
		if sufficient, err = energy.Sub(*r.Delegator, prepaid); err != nil {
			return
		}
		if sufficient {
			return legacyTxBaseGasPrice, effectiveGasPrice, *r.Delegator, prepaid, func(rgas uint64) error {
				_, err := doReturnGas(rgas)
				return err
			}, nil
		}
		return nil, nil, thor.Address{}, nil, nil, errors.New("insufficient energy")
	}

	commonTo := r.CommonTo()
	if commonTo != nil {
		binding := builtin.Prototype.Native(state).Bind(*commonTo)
		var credit *big.Int
		if credit, err = binding.UserCredit(r.Origin, blockTime); err != nil {
			return
		}
		if credit.Cmp(prepaid) >= 0 {
			doReturnGasAndSetCredit := func(rgas uint64) error {
				returnedEnergy, err := doReturnGas(rgas)
				if err != nil {
					return err
				}

				usedEnergy := new(big.Int).Sub(prepaid, returnedEnergy)
				return binding.SetUserCredit(r.Origin, new(big.Int).Sub(credit, usedEnergy), blockTime)
			}
			var sponsor thor.Address
			if sponsor, err = binding.CurrentSponsor(); err != nil {
				return
			}

			var isSponsor bool
			if isSponsor, err = binding.IsSponsor(sponsor); err != nil {
				return
			}

			// has enough credit
			if isSponsor {
				// deduct from sponsor, if any
				var ok bool
				ok, err = energy.Sub(sponsor, prepaid)
				if err != nil {
					return
				}
				if ok {
					return legacyTxBaseGasPrice, effectiveGasPrice, sponsor, prepaid, doReturnGasAndSetCredit, nil
				}
			}
			// deduct from To
			var sufficient bool
			sufficient, err = energy.Sub(*commonTo, prepaid)
			if err != nil {
				return
			}
			if sufficient {
				return legacyTxBaseGasPrice, effectiveGasPrice, *commonTo, prepaid, doReturnGasAndSetCredit, nil
			}
		}
	}

	// fallback to deduct from tx origin
	var sufficient bool
	if sufficient, err = energy.Sub(r.Origin, prepaid); err != nil {
		return
	}

	if sufficient {
		return legacyTxBaseGasPrice, effectiveGasPrice, r.Origin, prepaid, func(rgas uint64) error { _, err := doReturnGas(rgas); return err }, nil
	}
	return nil, nil, thor.Address{}, nil, nil, errors.New("insufficient energy")
}

// ToContext create a tx context object.
func (r *ResolvedTransaction) ToContext(
	gasPrice *big.Int,
	gasPayer thor.Address,
	blockNumber uint32,
	getBlockID func(uint32) (thor.Bytes32, error),
) (*xenv.TransactionContext, error) {
	provedWork, err := r.tx.ProvedWork(blockNumber, getBlockID)
	if err != nil {
		return nil, err
	}
	return &xenv.TransactionContext{
		ID:          r.tx.ID(),
		Origin:      r.Origin,
		GasPayer:    gasPayer,
		GasPrice:    gasPrice,
		ProvedWork:  provedWork,
		BlockRef:    r.tx.BlockRef(),
		Expiration:  r.tx.Expiration(),
		ClauseCount: uint32(len(r.Clauses)),
	}, nil
}
