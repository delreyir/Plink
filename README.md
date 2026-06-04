# Plink

**Request USDC with a link.** Non-custodial payment links on [Arc](https://docs.arc.io) — the Layer-1 by Circle where USDC is the native gas token.

Set an amount, share a link, get paid. No wallet address to copy, no invoice software, no 2.9% + 30¢. Funds move wallet-to-wallet and settle in under a second.

```
amount + recipient  →  https://plink.xyz/pay?to=0x…&amt=49.00&for=Logo%20design  →  paid in USDC on Arc
```

**Live demo:** https://plink-wine.vercel.app

> Testnet preview. Use test USDC only.

## Why it works

- **Non-custodial** — Plink never holds funds. The payer's wallet transfers USDC directly to the recipient.
- **Serverless** — the whole request lives in the URL. No backend, no database, nothing to go down.
- **Gas in USDC** — Arc uses USDC as the native gas token, so payers never need a separate volatile coin.
- **Sub-second finality** — receipt and funds arrive together.
- **Open source** — MIT licensed end to end.

## How it works

1. **Create** a link — set an amount in USDC, an optional note, and the recipient (your connected wallet by default).
2. **Share** the link or QR code — drop it in a DM, an email, or on your site.
3. **Get paid** — the payer connects a wallet on Arc, taps pay, and USDC moves wallet-to-wallet, final in under a second.

### What's in the app

| Route | What it does |
| --- | --- |
| `/` | Animated landing page |
| `/create` | Build a payment link (amount, note, recipient) with a live QR code |
| `/pay` | Checkout — decodes the link and lets the payer send USDC on Arc |
| `/dashboard` | Payments history — reads your wallet's USDC activity straight from Arc |
| `/docs` | How Plink works, link format, and network details |

### How the link works

A payment request is encoded into the URL query string — no backend needed:

- `to` — recipient wallet address (checksummed)
- `amt` — amount of USDC, up to 6 decimals
- `for` — optional memo shown on the checkout

The `/pay` route decodes it, connects the payer's wallet, and calls `transfer`
on the USDC ERC-20 interface on Arc.

### Dashboard

The dashboard reads recent USDC `Transfer` events for the connected wallet
directly from the Arc RPC — no indexer or backend. Because Arc caps
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

Stack: Vite + React + TypeScript + Tailwind, wagmi + viem for chain access. The
default payment flow is a plain USDC `transfer`, so the app needs no contract
deployed to work.

### Deploying

The app is a single-page app, so deep links like `/pay` and `/dashboard` need a
rewrite to `index.html`. The included `vercel.json` handles this on Vercel; any
static host needs an equivalent SPA fallback.

## Optional: PaymentRouter contract

For merchants who want on-chain reconciliation, `contracts/` ships an optional
`PaymentRouter`. It tags each payment with a `linkId`, emits a
`PaymentReceived` event you can index, and can collect an optional app fee in
basis points (capped at 2%). It is non-custodial — USDC is pulled from the
payer and pushed to the recipient in the same transaction.

```bash
cd contracts
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge test                                   # run the test suite
forge script script/Deploy.s.sol \
  --rpc-url arc_testnet --broadcast          # deploy to Arc Testnet
```

## License

MIT
