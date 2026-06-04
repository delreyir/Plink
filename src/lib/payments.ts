import { usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
  type Address,
  type Log,
  type PublicClient,
  getAddress,
  parseAbiItem,
} from "viem";
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
 * Arc's RPC caps eth_getLogs at a 10,000-block range per request, so we scan
 * in windows of MAX_RANGE. CHUNKS controls how far back we look in total
 * (CHUNKS * MAX_RANGE blocks). Windows are fetched in small parallel batches
 * to stay friendly to the RPC.
 */
const MAX_RANGE = 9_500n;
const CHUNKS = 12; // ~114k blocks of history
const BATCH = 4; // concurrent getLogs requests

export function usePayments(account?: Address) {
  const client = usePublicClient();

  return useQuery({
    queryKey: ["payments", account, client?.chain?.id],
    enabled: Boolean(account && client),
    refetchInterval: 15_000,
    queryFn: async (): Promise<PaymentRow[]> => {
      if (!account || !client) return [];

      const latest = await client.getBlockNumber();
      const windows = buildWindows(latest, MAX_RANGE, CHUNKS);

      const logs: Log[] = [];
      for (let i = 0; i < windows.length; i += BATCH) {
        const slice = windows.slice(i, i + BATCH);
        const results = await Promise.all(
          slice.flatMap(({ from, to }) => [
            getLogsSafe(client, { to: account }, from, to),
            getLogsSafe(client, { from: account }, from, to),
          ])
        );
        for (const r of results) logs.push(...r);
      }

      const seen = new Set<string>();
      const rows: PaymentRow[] = [];
      for (const log of logs) {
        const row = toRow(log, account);
        if (!row) continue;
        const key = `${row.hash}-${row.direction}-${log.logIndex}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push(row);
      }

      rows.sort((a, b) => Number(b.blockNumber - a.blockNumber));
      return rows;
    },
  });
}

function buildWindows(latest: bigint, range: bigint, chunks: number) {
  const windows: { from: bigint; to: bigint }[] = [];
  let to = latest;
  for (let i = 0; i < chunks; i++) {
    if (to < 0n) break;
    const from = to >= range ? to - range + 1n : 0n;
    windows.push({ from, to });
    if (from === 0n) break;
    to = from - 1n;
  }
  return windows;
}

async function getLogsSafe(
  client: PublicClient,
  args: { from?: Address; to?: Address },
  fromBlock: bigint,
  toBlock: bigint
): Promise<Log[]> {
  try {
    return (await client.getLogs({
      address: USDC_ADDRESS,
      event: transferEvent,
      args: args as never,
      fromBlock,
      toBlock,
    })) as Log[];
  } catch {
    // A single failing window shouldn't break the whole dashboard.
    return [];
  }
}

function toRow(log: Log, account: Address): PaymentRow | null {
  const args = (log as unknown as {
    args?: { from?: string; to?: string; value?: bigint };
  }).args;
  if (!args || args.value === undefined || !args.from || !args.to) return null;

  const acct = getAddress(account);
  const from = getAddress(args.from);
  const to = getAddress(args.to);
  const direction: "in" | "out" = to === acct ? "in" : "out";

  return {
    hash: log.transactionHash ?? "",
    from,
    to,
    amount: args.value,
    blockNumber: log.blockNumber ?? 0n,
    direction,
  };
}
