import { defineChain } from "viem";

/**
 * Arc Testnet — the Layer-1 by Circle where USDC is the native gas token.
 * Values sourced from the official Arc docs:
 *   https://docs.arc.io/arc/references/connect-to-arc
 *   https://docs.arc.io/arc/references/contract-addresses
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 18, // native gas accounting uses 18 decimals on Arc
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
      webSocket: ["wss://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arcscan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});

/**
 * USDC ERC-20 interface on Arc Testnet.
 * The native gas balance uses 18 decimals, but the ERC-20 interface used by
 * apps for transfers/approvals uses 6 decimals. We use the ERC-20 interface
 * everywhere in the app, so USDC_DECIMALS = 6.
 */
export const USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as const;
export const USDC_DECIMALS = 6;
export const USDC_SYMBOL = "USDC";

/**
 * PaymentRouter contract on Arc Testnet.
 * Routes USDC from the payer to the recipient and emits a `PaymentReceived`
 * event tagged with the link id. Collects an optional protocol fee.
 * Source: contracts/src/PaymentRouter.sol
 */
export const PAYMENT_ROUTER_ADDRESS =
  "0x7b361a189560134bb0a441f5ff264857f6d18b9f" as const;
/** Protocol fee in basis points (100 = 1%). Cap = 200 (2%). Set at deploy. */
export const PAYMENT_ROUTER_FEE_BPS = 100;

export const EXPLORER_URL = "https://testnet.arcscan.app";
export const FAUCET_URL = "https://faucet.circle.com";

/** Minimum base fee enforced by the protocol on Arc Testnet. */
export const MIN_GAS_GWEI = 20n;

export function explorerTx(hash: string): string {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function explorerAddress(address: string): string {
  return `${EXPLORER_URL}/address/${address}`;
}
