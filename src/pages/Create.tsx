import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { isAddress, getAddress } from "viem";
import { ConnectButton } from "../components/ConnectButton";
import { UsdcBadge } from "../components/UsdcBadge";
import { CopyButton } from "../components/CopyButton";
import { QrCode } from "../components/QrCode";
import { buildPaymentUrl, isValidAmount, formatUsd } from "../lib/link";

export function Create() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [toOverride, setToOverride] = useState("");
  const [useConnected, setUseConnected] = useState(true);

  const recipient = useConnected ? address ?? "" : toOverride.trim();

  const recipientValid = isAddress(recipient);
  const amountValid = isValidAmount(amount);
  const canBuild = recipientValid && amountValid;

  const link = useMemo(() => {
    if (!canBuild) return "";
    return buildPaymentUrl({
      to: getAddress(recipient),
      amount,
      label: label || undefined,
    });
  }, [canBuild, recipient, amount, label]);

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-mint">
            Create
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Build a payment link
          </h1>
          <p className="mt-3 max-w-xl text-haze">
            Set an amount in USDC and share the link. Anyone can pay it from any
            wallet on Arc — no account needed on either side.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="card p-7">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Request details</h2>
              <UsdcBadge />
            </div>

            <div className="space-y-6">
              <div>
                <label className="label" htmlFor="amount">
                  Amount (USDC)
                </label>
                <div className="relative">
                  <input
                    id="amount"
                    inputMode="decimal"
                    placeholder="49.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="field pr-16 font-mono text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-haze">
                    USDC
                  </span>
                </div>
                {amount && !amountValid && (
                  <p className="mt-2 text-xs text-amber-300">
                    Enter a positive amount with up to 6 decimals.
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="label">
                  What's it for? (optional)
                </label>
                <input
                  id="label"
                  placeholder="Logo design — final files"
                  value={label}
                  maxLength={80}
                  onChange={(e) => setLabel(e.target.value)}
                  className="field"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="label mb-0">Pay to</span>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-haze">
                    <input
                      type="checkbox"
                      checked={useConnected}
                      onChange={(e) => setUseConnected(e.target.checked)}
                      className="accent-mint"
                    />
                    Use my connected wallet
                  </label>
                </div>

                {useConnected ? (
                  isConnected ? (
                    <div className="field flex items-center justify-between font-mono text-sm">
                      <span className="truncate">{address}</span>
                      <span className="ml-2 shrink-0 text-mint">✓</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3">
                      <span className="text-sm text-haze">
                        Connect to autofill
                      </span>
                      <ConnectButton />
                    </div>
                  )
                ) : (
                  <input
                    placeholder="0x…"
                    value={toOverride}
                    onChange={(e) => setToOverride(e.target.value)}
                    className="field font-mono text-sm"
                  />
                )}
                {!useConnected && toOverride && !recipientValid && (
                  <p className="mt-2 text-xs text-amber-300">
                    That doesn't look like a valid address.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="card flex flex-col p-7">
            <h2 className="mb-6 text-lg font-semibold">Your link</h2>

            {!canBuild ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
                <div className="mb-3 text-3xl">🔗</div>
                <p className="text-sm text-haze">
                  Fill in an amount and recipient to generate your link.
                </p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="flex flex-col items-center gap-5 rounded-xl border border-white/8 bg-ink-900/60 p-6">
                  <QrCode value={link} size={172} />
                  <div className="text-center">
                    <div className="font-mono text-3xl font-bold text-white">
                      {formatUsd(amount)}{" "}
                      <span className="text-base text-haze">USDC</span>
                    </div>
                    {label && (
                      <div className="mt-1 text-sm text-haze">{label}</div>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <span className="label">Shareable URL</span>
                  <div className="break-all rounded-xl border border-white/10 bg-ink-900/80 p-3 font-mono text-xs text-mint-soft">
                    {link}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <CopyButton value={link} label="Copy link" />
                  <Link
                    to={link.replace(window.location.origin, "")}
                    className="btn-ghost"
                  >
                    Preview checkout →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
