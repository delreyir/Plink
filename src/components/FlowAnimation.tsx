import { useEffect, useState } from "react";

/**
 * Animated, looping visualization of the Plink flow:
 * create link → share → payer pays → settled. Pure CSS/JS, no deps.
 */
const STEPS = [
  { tag: "create", text: "Request 50.00 USDC · “Logo design”", icon: "✦" },
  { tag: "share", text: "plinkarc.xyz/pay?to=0x8a3f…&amt=50.00", icon: "↗" },
  { tag: "pay", text: "Payer signs · USDC on Arc", icon: "◎" },
  { tag: "settled", text: "Settled in 0.42s · +50.00 USDC", icon: "✓" },
];

export function FlowAnimation() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % STEPS.length);
    }, 1900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto max-w-md">
      {/* glow */}
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-mint/20 via-blue-500/10 to-transparent blur-3xl animate-glowPulse" />

      <div className="card overflow-hidden shadow-card animate-float">
        <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3.5">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-mint/70" />
          <span className="ml-3 font-mono text-xs text-haze">
            Plink, live on Arc
          </span>
        </div>

        <div className="space-y-3 p-6">
          {STEPS.map((step, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <div
                key={step.tag}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500 ${
                  current
                    ? "border-mint/40 bg-mint/5 scale-[1.02]"
                    : done
                    ? "border-white/8 bg-white/[0.02] opacity-60"
                    : "border-white/8 bg-transparent opacity-30"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm transition-colors ${
                    current || done
                      ? "bg-mint/15 text-mint"
                      : "bg-white/5 text-haze"
                  }`}
                >
                  {step.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-haze">
                    {step.tag}
                  </div>
                  <div className="truncate font-mono text-sm text-white">
                    {step.text}
                    {current && (
                      <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-mint animate-blink" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-px border-t border-white/8 bg-white/5 text-center">
          {[
            ["Network", "Arc"],
            ["Settles", "< 1s"],
            ["Fee", "1%"],
          ].map(([k, v]) => (
            <div key={k} className="bg-ink-850 py-3.5">
              <div className="text-[10px] uppercase tracking-wider text-haze">
                {k}
              </div>
              <div className="mt-0.5 font-mono text-sm font-semibold text-white">
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
