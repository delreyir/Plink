import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { ConnectButton } from "../components/ConnectButton";
import { usePayments, type PaymentRow } from "../lib/payments";
import { fromBaseUnits, formatUsd, shortAddress } from "../lib/link";
import { explorerTx, explorerAddress } from "../lib/arc";

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: payments, isLoading, isError, refetch, isFetching } =
    usePayments(address);

  const received = useMemo(
    () => (payments ?? []).filter((p) => p.direction === "in"),
    [payments]
  );

  const totalReceived = useMemo(
    () => received.reduce((sum, p) => sum + p.amount, 0n),
    [received]
  );

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-mint">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Payments
            </h1>
            <p className="mt-3 max-w-xl text-haze">
              USDC activity for your connected wallet, read straight from Arc.
            </p>
          </div>
          {isConnected && (
            <button
              onClick={() => refetch()}
              className="btn-ghost self-start sm:self-auto"
              disabled={isFetching}
            >
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
          )}
        </header>

        {!isConnected ? (
          <EmptyState
            title="Connect your wallet"
            body="Connect to see the payments that have landed in your wallet."
            action={<ConnectButton />}
          />
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Received"
                value={`${formatUsd(fromBaseUnits(totalReceived))} USDC`}
                accent
              />
              <StatCard label="Payments in" value={String(received.length)} />
              <StatCard
                label="Window"
                value="~recent"
                hint="last ~50k blocks"
              />
            </div>

            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
                <h2 className="font-semibold">Activity</h2>
                <span className="pill">USDC · Arc</span>
              </div>

              {isLoading ? (
                <LoadingRows />
              ) : isError ? (
                <div className="px-6 py-12 text-center text-sm text-amber-300">
                  Couldn't load activity from the RPC. Try refreshing.
                </div>
              ) : (payments ?? []).length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mb-3 text-3xl">🪙</div>
                  <p className="text-sm text-haze">
                    No USDC activity yet. Create a link and share it to get
                    paid.
                  </p>
                  <Link to="/create" className="btn-primary mt-5">
                    Create a payment link
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {(payments ?? []).map((p, i) => (
                    <PaymentItem key={`${p.hash}-${i}`} row={p} />
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-haze/60">
              Read live from Arc Testnet RPC · no backend, no indexer.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function PaymentItem({ row }: { row: PaymentRow }) {
  const incoming = row.direction === "in";
  return (
    <li className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
            incoming
              ? "bg-mint/15 text-mint"
              : "bg-white/5 text-haze"
          }`}
        >
          {incoming ? "↓" : "↑"}
        </span>
        <div>
          <div className="text-sm font-medium text-white">
            {incoming ? "Received" : "Sent"}
          </div>
          <a
            href={explorerAddress(incoming ? row.from : row.to)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-haze underline-offset-4 hover:underline"
          >
            {incoming ? "from " : "to "}
            {shortAddress(incoming ? row.from : row.to, 5)}
          </a>
        </div>
      </div>

      <div className="text-right">
        <div
          className={`font-mono text-sm font-semibold ${
            incoming ? "text-mint" : "text-white"
          }`}
        >
          {incoming ? "+" : "−"}
          {formatUsd(fromBaseUnits(row.amount))} USDC
        </div>
        {row.hash && (
          <a
            href={explorerTx(row.hash)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] text-haze/70 underline-offset-4 hover:underline"
          >
            {shortAddress(row.hash, 5)}
          </a>
        )}
      </div>
    </li>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-haze">{label}</div>
      <div
        className={`mt-2 font-mono text-2xl font-bold ${
          accent ? "text-mint" : "text-white"
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-haze/60">{hint}</div>}
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-20 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-haze">{body}</p>
      {action}
    </div>
  );
}

function LoadingRows() {
  return (
    <ul className="divide-y divide-white/5">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-white/5" />
            <div className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
              <div className="h-2.5 w-32 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
        </li>
      ))}
    </ul>
  );
}
