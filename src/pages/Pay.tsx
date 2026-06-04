import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi } from "../lib/abi";
import { USDC_ADDRESS, explorerTx, explorerAddress, FAUCET_URL } from "../lib/arc";
import {
  parsePaymentRequest,
  toBaseUnits,
  fromBaseUnits,
  formatUsd,
  shortAddress,
} from "../lib/link";
import { ConnectButton } from "../components/ConnectButton";

export function Pay() {
  const [params] = useSearchParams();
  const request = useMemo(() => parsePaymentRequest(params), [params]);

  if (!request) {
    return (
      <div className="container-page py-24">
        <div className="card mx-auto max-w-md p-10 text-center">
          <h1 className="text-2xl font-bold">Invalid payment link</h1>
          <p className="mt-3 text-haze">
            This link is missing a valid recipient or amount.
          </p>
          <Link to="/create" className="btn-primary mt-6">
            Create a new link
          </Link>
        </div>
      </div>
    );
  }

  return <Checkout to={request.to} amount={request.amount} label={request.label} />;
}

function Checkout({
  to,
  amount,
  label,
}: {
  to: string;
  amount: string;
  label?: string;
}) {
  const { address, isConnected, chainId } = useAccount();
  const baseUnits = toBaseUnits(amount);

  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: USDC_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 6000 },
  });

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({ hash });

  const insufficient =
    balance !== undefined && (balance as bigint) < baseUnits;
  const onArc = chainId === 5042002;
  const isSelf =
    address && address.toLowerCase() === to.toLowerCase();

  function pay() {
    writeContract({
      abi: erc20Abi,
      address: USDC_ADDRESS,
      functionName: "transfer",
      args: [to as `0x${string}`, baseUnits],
    });
  }

  if (isSuccess && hash) {
    return <Success amount={amount} to={to} hash={hash} onReset={reset} />;
  }

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md">
        <div className="card overflow-hidden shadow-card">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <span className="font-mono text-xs text-haze">plink · checkout</span>
            <span className="pill">USDC on Arc</span>
          </div>

          <div className="px-7 py-8">
            <p className="text-sm text-haze">Payment request from</p>
            <a
              href={explorerAddress(to)}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-white underline-offset-4 hover:underline"
            >
              {shortAddress(to, 6)}
            </a>

            <div className="mt-6 flex items-end gap-2">
              <span className="font-mono text-5xl font-bold tracking-tight">
                {formatUsd(amount)}
              </span>
              <span className="mb-1.5 text-lg font-semibold text-haze">
                USDC
              </span>
            </div>
            {label && <p className="mt-2 text-sm text-haze">{label}</p>}

            <div className="mt-8">
              {!isConnected ? (
                <div className="flex flex-col gap-3">
                  <ConnectButton />
                  <p className="text-center text-xs text-haze">
                    Connect a wallet on Arc Testnet to pay.
                  </p>
                </div>
              ) : !onArc ? (
                <div className="flex flex-col gap-3">
                  <ConnectButton />
                  <p className="text-center text-xs text-amber-300">
                    Switch to Arc Testnet to continue.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    className="btn-primary w-full py-3.5 text-base"
                    disabled={isPending || isConfirming || insufficient}
                    onClick={pay}
                  >
                    {isPending
                      ? "Confirm in wallet…"
                      : isConfirming
                      ? "Settling…"
                      : `Pay ${formatUsd(amount)} USDC`}
                  </button>

                  {balance !== undefined && (
                    <p className="mt-3 text-center text-xs text-haze">
                      Your balance:{" "}
                      <span className="font-mono text-white">
                        {formatUsd(fromBaseUnits(balance as bigint))} USDC
                      </span>
                    </p>
                  )}

                  {isSelf && (
                    <Note tone="amber">
                      Heads up: this link pays your own connected wallet (you'll
                      just pay gas). Fine for testing the flow.
                    </Note>
                  )}
                  {insufficient && (
                    <Note tone="amber">
                      Not enough USDC.{" "}
                      <a
                        className="underline"
                        href={FAUCET_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Get test USDC →
                      </a>
                    </Note>
                  )}
                  {error && (
                    <Note tone="red">
                      {humanizeError(error.message)}
                    </Note>
                  )}
                  {hash && isConfirming && (
                    <Note tone="mint">
                      Broadcast.{" "}
                      <a
                        className="underline"
                        href={explorerTx(hash)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on Arcscan →
                      </a>
                    </Note>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px border-t border-white/8 bg-white/5 text-center">
            <Foot k="Network" v="Arc" />
            <Foot k="Settles" v="< 1s" />
            <Foot k="Fee" v="0%" />
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-haze/70">
          Non-custodial · funds move wallet to wallet · testnet preview
        </p>
      </div>
    </div>
  );
}

function Success({
  amount,
  to,
  hash,
  onReset,
}: {
  amount: string;
  to: string;
  hash: string;
  onReset: () => void;
}) {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md">
        <div className="card overflow-hidden p-8 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/15">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="m5 13 4 4L19 7"
                stroke="#5ef2b0"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold">Payment settled</h1>
          <p className="mt-2 text-haze">
            <span className="font-mono text-white">{formatUsd(amount)} USDC</span>{" "}
            sent to {shortAddress(to, 6)}.
          </p>

          <a
            href={explorerTx(hash)}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost mt-6 w-full font-mono text-xs"
          >
            View transaction on Arcscan →
          </a>
          <button onClick={onReset} className="btn-primary mt-3 w-full">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Foot({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-ink-850 py-4">
      <div className="text-[10px] uppercase tracking-wider text-haze">{k}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold text-white">
        {v}
      </div>
    </div>
  );
}

function Note({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "amber" | "red" | "mint";
}) {
  const tones = {
    amber: "border-amber-400/30 text-amber-200",
    red: "border-red-400/30 text-red-200",
    mint: "border-mint/30 text-mint-soft",
  };
  return (
    <p
      className={`mt-3 rounded-lg border px-3 py-2 text-center text-xs ${tones[tone]}`}
    >
      {children}
    </p>
  );
}

function humanizeError(msg: string): string {
  if (/insufficient funds/i.test(msg))
    return "Insufficient USDC to cover the amount plus gas.";
  if (/user rejected|denied/i.test(msg)) return "Transaction rejected in wallet.";
  if (/underpriced/i.test(msg))
    return "Gas price too low — Arc requires at least 20 Gwei.";
  return "Something went wrong. Please try again.";
}
