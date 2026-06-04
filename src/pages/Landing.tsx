import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { FlowAnimation } from "../components/FlowAnimation";

export function Landing() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Marquee />
      <Steps />
      <Bento />
      <BigStatement />
      <Cta />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      {/* animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[36rem] w-[36rem] rounded-full bg-mint/10 blur-[120px] animate-glowPulse" />
        <div className="absolute top-20 -left-32 h-[30rem] w-[30rem] rounded-full bg-blue-500/10 blur-[120px] animate-glowPulse [animation-delay:1.5s]" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:54px_54px] [mask-image:radial-gradient(70%_55%_at_50%_0%,black,transparent)]" />

      <div className="container-page grid gap-14 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-32">
        <div>
          <Reveal>
            <span className="pill mb-7 border-mint/20 bg-mint/5 text-mint-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulseDot" />
              Live on Arc Testnet · USDC native
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Get paid in USDC,
              <br />
              <span className="text-glow animate-gradientShift">
                with a single link.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-haze">
              No wallet address to copy. No invoice software. No 2.9% + 30¢.
              Set an amount, share a link, and the money lands in your wallet,
              final in under a second on Arc, the Layer 1 by Circle.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/create"
                className="btn-primary group px-7 py-4 text-base"
              >
                Create a payment link
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link to="/docs" className="btn-ghost px-7 py-4 text-base">
                Read the docs
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6">
              {[
                ["< 1s", "Settlement"],
                ["0%", "Platform fee"],
                ["USDC", "Native gas"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="font-mono text-3xl font-bold text-white">
                    {v}
                  </dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-haze">
                    {k}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <FlowAnimation />
        </Reveal>
      </div>
    </section>
  );
}

const marqueeItems = [
  "Non-custodial",
  "USDC as gas",
  "Sub-second finality",
  "Open source · MIT",
  "No KYC",
  "EVM compatible",
  "Wallet to wallet",
  "Built on Arc",
];

function Marquee() {
  return (
    <section className="border-y border-white/8 bg-ink-900/40 py-5">
      <div className="mask-fade-x overflow-hidden">
        <div className="flex w-max animate-marquee gap-10 pr-10">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-haze"
            >
              <span className="h-1 w-1 rounded-full bg-mint" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    n: "01",
    title: "Set the amount",
    body: "Enter how much USDC you want and an optional note. No account, no onboarding, no KYC.",
  },
  {
    n: "02",
    title: "Share the link",
    body: "Plink encodes the request into a URL or QR. Drop it in a DM, an email, or on your site.",
  },
  {
    n: "03",
    title: "Get paid instantly",
    body: "The payer connects, taps pay, and USDC moves wallet-to-wallet. Final in under a second.",
  },
];

function Steps() {
  return (
    <section className="container-page py-28">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-mint">
          How it works
        </p>
        <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Three steps from request to settled.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 120}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-ink-850/70 p-8 transition-colors hover:border-mint/30">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-mint/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="font-mono text-sm text-mint">{s.n}</div>
              <h3 className="mt-5 text-xl font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-haze">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const bento = [
  {
    title: "Non-custodial by design",
    body: "Funds move directly between wallets. Plink never holds a balance and has no access to your money.",
    span: "md:col-span-2",
  },
  {
    title: "Just a URL",
    body: "The whole request lives in the link. No backend, no database.",
    span: "",
  },
  {
    title: "Gas paid in USDC",
    body: "Arc uses USDC as the native gas token, so there's no separate volatile coin to hold.",
    span: "",
  },
  {
    title: "Sub-second finality",
    body: "Arc finalizes blocks in under a second. The receipt and the funds arrive together.",
    span: "md:col-span-2",
  },
];

function Bento() {
  return (
    <section className="border-y border-white/8 bg-ink-900/30">
      <div className="container-page py-28">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-mint">
            Why Plink
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            A payment processor that gets out of the way.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {bento.map((b, i) => (
            <Reveal key={b.title} delay={i * 100} className={b.span}>
              <div className="group h-full overflow-hidden rounded-2xl border border-white/8 bg-ink-850 p-8 transition-all hover:-translate-y-1 hover:border-mint/30">
                <h3 className="text-lg font-semibold text-white">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-haze">
                  {b.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BigStatement() {
  return (
    <section className="container-page py-32 text-center">
      <Reveal>
        <h2 className="mx-auto max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Card rails are a{" "}
          <span className="text-haze line-through decoration-mint/40">
            promise
          </span>
          . Plink is a{" "}
          <span className="text-glow animate-gradientShift">transfer.</span>
        </h2>
      </Reveal>
      <Reveal delay={120}>
        <p className="mx-auto mt-6 max-w-xl text-lg text-haze">
          No chargebacks, no holds, no middleman taking a cut. Just money moving
          from one wallet to another, instantly.
        </p>
      </Reveal>
    </section>
  );
}

function Cta() {
  return (
    <section className="container-page pb-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-ink-850 p-12 text-center sm:p-20">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-mint/15 blur-[100px] animate-glowPulse" />
          </div>
          <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:40px_40px] opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />

          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Your first link takes ten seconds.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-haze">
            Grab test USDC from the Circle faucet, create a link, and watch a
            payment settle live on Arc.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/create" className="btn-primary px-7 py-4 text-base">
              Create a payment link
            </Link>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost px-7 py-4 text-base"
            >
              Get test USDC
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
