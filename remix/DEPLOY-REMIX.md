# Deploy GMGNHub on Base (Remix)

1. Open [remix.ethereum.org](https://remix.ethereum.org)
2. Upload `contracts/src/GMGNHub.sol` and `contracts/src/SimpleToken.sol`
3. Compiler: **0.8.24**
4. Deploy **GMGNHub** on **Base Mainnet** (chain 8453)
5. Copy address → `src/config/contract.ts` → `HUB_CONTRACT_ADDRESS`

## Points (onchain)

| Action | Cost | Points |
|--------|------|--------|
| GM (free, 3/day) | 0 | 10 |
| GM (paid) | 0.0001 ETH | 20 |
| Deploy token (1st lifetime) | 0 | 20 |
| Deploy token (after) | 0.0001 ETH | 40 |

Token deploy creates a minimal ERC20 (name, symbol, supply) minted to your wallet.
