import { usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { type Address, type Log, getAddress, parseAbiItem } from "viem";
import { USDC_ADDRESS } from "./arc";

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

export interface PaymentRow {
  hash: string;
  from: string;
  to: string;
  amount: bigint;
  blockNumber: bigint;
  direction: "in" | "out";
}

/**
 * How far back to scan for Transfer events, in blocks. Arc has ~0.48s blocks,
 * so this covers a generous recent window without overloading the RPC.
 */
const LOOKBACK_BLOCKS = 50_000n;

/**
 * Reads recent USDC transfers touching `account` directly from the chain.
 * Returns both incoming (payments received) and outgoing transfers, newest
 * first. No backend or indexer required — this queries Arc's RPC for the
 * standard ERC-20 Transfer event.
 */
export function usePayments(account?: Address) {
  const client = usePublicClient();

  return useQuery({
    queryKey: ["payments", account, client?.chain?.id],
    enabled: Boolean(account && client),
    refetchInterval: 12_000,
    queryFn: async (): Promise<PaymentRow[]> => {
      if (!account || !client) return [];

      const latest = await client.getBlockNumber();
      const fromBlock = latest > LOOKBACK_BLOCKS ? latest - LOOKBACK_BLOCKS : 0n;

      // Two queries: transfers TO me (received) and FROM me (sent).
      const [incoming, outgoing] = await Promise.all([
        client.getLogs({
          address: USDC_ADDRESS,
          event: transferEvent,
          args: { to: account },
          fromBlock,
          toBlock: "latest",
        }),
        client.getLogs({
          address: USDC_ADDRESS,
          event: transferEvent,
          args: { from: account },
          fromBlock,
          toBlock: "latest",
        }),
      ]);

      const rows = [
        ...incoming.map((log) => toRow(log, account, "in")),
        ...outgoing.map((log) => toRow(log, account, "out")),
      ].filter((r): r is PaymentRow => r !== null);

      // Newest first.
      rows.sort((a, b) => Number(b.blockNumber - a.blockNumber));
      return rows;
    },
  });
}

function toRow(
  log: Log,
  account: Address,
  direction: "in" | "out"
): PaymentRow | null {
  // viem decodes indexed/non-indexed args onto log.args for typed event logs.
  const args = (log as unknown as {
    args?: { from?: string; to?: string; value?: bigint };
  }).args;
  if (!args || args.value === undefined || !args.from || !args.to) return null;

  // Ignore self-transfers showing up twice; keep them tagged by direction.
  const self =
    getAddress(args.from) === getAddress(account) &&
    getAddress(args.to) === getAddress(account);
  if (self && direction === "out") return null; // de-dupe self payments

  return {
    hash: log.transactionHash ?? "",
    from: getAddress(args.from),
    to: getAddress(args.to),
    amount: args.value,
    blockNumber: log.blockNumber ?? 0n,
    direction,
  };
}
