/** Decorative hero card: a stylized preview of a Plink checkout. */
export function LinkPreviewCard() {
  return (
    <div className="relative mx-auto max-w-md">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-mint/20 via-transparent to-blue-500/10 blur-2xl" />
      <div className="card overflow-hidden shadow-card">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <div className="flex items-center gap-2 font-mono text-xs text-haze">
            <span className="h-2 w-2 rounded-full bg-mint animate-pulseDot" />
            plink.xyz/pay
          </div>
          <span className="pill">USDC on Arc</span>
        </div>

        <div className="px-6 py-8">
          <p className="text-sm text-haze">Payment request from</p>
          <p className="font-mono text-sm text-white">0x8a3f…c21d</p>

          <div className="mt-6 flex items-end gap-2">
            <span className="font-mono text-5xl font-bold tracking-tight text-white">
              49.00
            </span>
            <span className="mb-1.5 text-lg font-semibold text-haze">USDC</span>
          </div>
          <p className="mt-2 text-sm text-haze">Logo design — final files</p>

          <button className="btn-primary mt-8 w-full py-3.5 text-base" disabled>
            Pay 49.00 USDC
          </button>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <MiniStat k="Network" v="Arc" />
            <MiniStat k="Settles" v="< 1s" />
            <MiniStat k="Fee" v="0%" />
          </div>
        </div>

        <div className="border-t border-white/8 px-6 py-3 text-center text-xs text-haze/70">
          Non-custodial · wallet to wallet
        </div>
      </div>
    </div>
  );
}

function MiniStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-ink-900/60 py-3">
      <div className="text-[10px] uppercase tracking-wider text-haze">{k}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold text-white">
        {v}
      </div>
    </div>
  );
}
