# VeChain Thor SDK Solution

## Problem Identified
Using ethers.js JsonRpcProvider against VeChain Thor REST API endpoints. These are incompatible:

- **ethers.js**: Expects JSON-RPC protocol (`{"jsonrpc":"2.0","method":"eth_chainId"}`)
- **VeChain Thor**: Uses REST API protocol (`GET /v1/blocks/best`)

## Diagnostic Results
```
▶ https://testnet.veblocks.net/v1/node/status
HTTP/2 404 - 404 page not found

▶ https://testnet.veblocks.net/
HTTP/2 307 - REDIRECT:https://testnet.veblocks.net/doc/stoplight-ui/
```

Headers show: `x-thorest-ver: 2.3.0` (Thor REST API, not JSON-RPC)

## Solution: Use VeChain Thor SDK
Replace ethers.js JsonRpcProvider with proper VeChain Thor SDK:

1. **@vechain/sdk-network** - For testnet connectivity
2. **@vechain/thor-devkit** - For transaction building
3. **VeChain Thor REST API endpoints** - Working with `/v1/` paths

## Implementation Plan
1. Replace ethers.js provider initialization with Thor SDK
2. Use proper VeChain transaction building
3. Test against working Thor REST endpoints
4. Maintain same VeBetterDAO contract integration

## Working VeChain Testnet Endpoints
- `https://testnet.veblocks.net` (Thor REST API)
- `https://sync-testnet.veblocks.net` (Thor REST API)

These endpoints work - we just need to use the correct protocol!