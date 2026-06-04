import { getAddress, isAddress, parseUnits, formatUnits } from "viem";
import { USDC_DECIMALS } from "./arc";

/**
 * A payment request encoded entirely in the URL. No backend, no database:
 * the link itself carries everything the payer needs. This keeps Plink
 * non-custodial and serverless — the recipient generates a link locally and
 * the payer's wallet does the rest.
 */
export interface PaymentRequest {
  /** Recipient wallet address (checksummed). */
  to: string;
  /** Human amount of USDC, e.g. "49.00". */
  amount: string;
  /** Optional memo / what the payment is for. */
  label?: string;
}

const PARAM_TO = "to";
const PARAM_AMOUNT = "amt";
const PARAM_LABEL = "for";

export function buildPaymentPath(req: PaymentRequest): string {
  const params = new URLSearchParams();
  params.set(PARAM_TO, req.to);
  params.set(PARAM_AMOUNT, req.amount);
  if (req.label && req.label.trim()) {
    params.set(PARAM_LABEL, req.label.trim());
  }
  return `/pay?${params.toString()}`;
}

export function buildPaymentUrl(req: PaymentRequest, origin?: string): string {
  const base = origin ?? window.location.origin;
  return `${base}${buildPaymentPath(req)}`;
}

export function parsePaymentRequest(
  search: string | URLSearchParams
): PaymentRequest | null {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const to = params.get(PARAM_TO);
  const amount = params.get(PARAM_AMOUNT);
  if (!to || !amount) return null;
  if (!isAddress(to)) return null;
  if (!isValidAmount(amount)) return null;

  return {
    to: getAddress(to),
    amount,
    label: params.get(PARAM_LABEL) ?? undefined,
  };
}

export function isValidAmount(value: string): boolean {
  if (!value) return false;
  if (!/^\d+(\.\d{1,6})?$/.test(value.trim())) return false;
  try {
    return parseUnits(value.trim(), USDC_DECIMALS) > 0n;
  } catch {
    return false;
  }
}

export function toBaseUnits(amount: string): bigint {
  return parseUnits(amount.trim(), USDC_DECIMALS);
}

export function fromBaseUnits(amount: bigint): string {
  return formatUnits(amount, USDC_DECIMALS);
}

export function shortAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

/** Format a USDC amount with thousands separators and 2 decimals for display. */
export function formatUsd(amount: string | number): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
