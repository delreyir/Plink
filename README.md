# Plink

**Request USDC with a link.** Non-custodial payment links on [Arc](https://docs.arc.io), the Layer 1 by Circle where USDC is the native gas token.

Set an amount, share a link, get paid. No wallet address to copy, no invoice software, no 2.9% + 30¢. Funds move wallet-to-wallet through an open `PaymentRouter` contract and settle in under a second.

```
amount + recipient  →  https://plinkarc.xyz/pay?to=0x…&amt=49.00&for=Logo%20design  →  paid in USDC on Arc
```

**Live:** https://plinkarc.xyz

> Testnet preview. Use test USDC only.

## Deployments (Arc Testnet)

| Role | Address |
| --- | --- |
| **PaymentRouter** | [`0x7b361a189560134bb0a441f5ff264857f6d18b9f`](https://testnet.arcscan.app/address/0x7b361a189560134bb0a441f5ff264857f6d18b9f) |
| Deployer | [`0xF597e203904D6fd52CF5768efd1f01fD6073afaE`](https://testnet.arcscan.app/address/0xF597e203904D6fd52CF5768efd1f01fD6073afaE) |
| Fee recipient | `0xF597e203904D6fd52CF5768efd1f01fD6073afaE` |
| Protocol fee | `100` bps (1%, capped at 200 bps in the contract) |
| USDC (Circle, ERC-20) | [`0x3600000000000000000000000000000000000000`](https://testnet.arcscan.app/address/0x3600000000000000000000000000000000000000) |
| Deploy tx | [`0x315f78488f9501354afdf2c0e08a325d33b0bc81e9cc3726486699971bf7bef1`](https://testnet.arcscan.app/tx/0x315f78488f9501354afdf2c0e08a325d33b0bc81e9cc3726486699971bf7bef1) |

The deployment record is also kept in [`contracts/deployments.arc-testnet.json`](./contracts/deployments.arc-testnet.json).

> Plink does not run a factory on Arc Testnet. The router is a single, immutable contract; it has no admin, no upgrade path, and no per-merchant deploys.

## Why it works

- **Non-custodial.** Funds are pulled from the payer and pushed to the recipient inside the same transaction. Plink and the router never hold a balance.
- **Serverless.** The whole request lives in the URL. No backend, no database, nothing to go down.
- **Gas in USDC.** Arc uses USDC as the native gas token, so payers never need a separate volatile coin.
- **Sub-second finality.** Receipt and funds arrive together.
- **Open source.** MIT licensed end to end.

## How it works

1. **Create** a link. Set an amount in USDC, an optional note, and the recipient (your connected wallet by default).
2. **Share** the link or QR code. Drop it in a DM, an email, or on your site.
3. **Get paid.** The payer connects a wallet on Arc, approves the router for the amount, and calls `pay`. USDC moves wallet-to-wallet, final in under a second.

### On-chain flow

```
payer ──approve(amount)──▶ USDC
payer ──pay(linkId, to, amount)──▶ PaymentRouter
                                       │
                                       ├── safeTransferFrom(payer → router, amount)
                                       ├── safeTransfer(router → recipient, net = amount - fee)
                                       ├── safeTransfer(router → feeRecipient, fee)
                                       └── emit PaymentReceived(linkId, payer, recipient, amount, fee)
```

`linkId` is a `bytes32` derived client-side from `keccak256(abi.encodePacked(to, amountBaseUnits, label))`, so the same link always emits the same id and on-chain events can be reconciled back to a specific payment link.

### Routes

| Route | What it does |
| --- | --- |
| `/` | Animated landing page |
| `/create` | Build a payment link (amount, note, recipient) with a live QR code |
| `/pay` | Checkout. Approves the router, then calls `pay` to settle on Arc |
| `/dashboard` | Payments history. Reads your wallet's USDC activity straight from Arc |
| `/docs` | How Plink works, link format, and network details |

### Link format

A payment request is encoded into the URL query string, with no backend needed:

- `to`: recipient wallet address (checksummed)
- `amt`: amount of USDC, up to 6 decimals
- `for`: optional memo shown on the checkout

The `/pay` route decodes it, derives the `linkId`, and walks the payer through approve + pay against the router.

### Dashboard

The dashboard reads recent USDC `Transfer` events for the connected wallet
directly from the Arc RPC, with no indexer or backend. Because Arc caps
`eth_getLogs` at a 10,000-block range, the scan is chunked into windows and
merged client-side.

## Arc network details

| | |
| --- | --- |
| Network | Arc Testnet |
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Gas token | USDC |
| USDC (ERC-20) | `0x3600000000000000000000000000000000000000` (6 decimals) |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |

## Frontend

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

Stack: Vite + React + TypeScript + Tailwind, wagmi + viem for chain access. The router address and fee bps are pinned in `src/lib/arc.ts`.

### Deploying the frontend

The app is a single-page app, so deep links like `/pay` and `/dashboard` need a
rewrite to `index.html`. The included `vercel.json` handles this on Vercel; any
static host needs an equivalent SPA fallback.

## PaymentRouter contract

Source: [`contracts/src/PaymentRouter.sol`](./contracts/src/PaymentRouter.sol). Built on OpenZeppelin's `SafeERC20` and `ReentrancyGuard`, Solidity `0.8.30`.

Key surface:

```solidity
function pay(bytes32 linkId, address to, uint256 amount) external nonReentrant;
event PaymentReceived(
    bytes32 indexed linkId,
    address indexed payer,
    address indexed recipient,
    uint256 amount,
    uint256 fee
);
```

Properties:

- Non-custodial. The router holds no balance between calls.
- Immutable fee. `feeBps` is set in the constructor and capped at `MAX_FEE_BPS = 200` (2%).
- No admin, no upgrade path. Once deployed, the contract is final.

### Deploy your own (Foundry)

```bash
cd contracts
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge test                                   # run the test suite
forge script script/Deploy.s.sol \
  --rpc-url arc_testnet --broadcast          # deploy to Arc Testnet
```

### Deploy your own (no Foundry, JS only)

The repo also ships JS deploy scripts that use `solc` + `viem` directly, so you don't need Foundry installed:

```bash
# 1. generate a fresh deployer wallet (saved to contracts/.deployer.json, gitignored)
node contracts/scripts/new-wallet.mjs

# 2. fund the printed address with test USDC from https://faucet.circle.com

# 3. compile + deploy. FEE_BPS defaults to 0; set it for a non-zero protocol fee.
FEE_BPS=100 node contracts/scripts/deploy.mjs
```

The deploy writes the resulting address, tx hash, and block number to `contracts/deployments.arc-testnet.json`.

## License

MIT
