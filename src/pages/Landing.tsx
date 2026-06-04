import { Link } from "react-router-dom";
import { LinkPreviewCard } from "../components/LinkPreviewCard";

export function Landing() {
  return (
    <>
      <Hero />
      <LogosStrip />
      <HowItWorks />
      <Features />
      <Compare />
      <CtaBand />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:48px_48px] [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)]" />
      <div className="container-page relative grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
        <div className="animate-fade-up">
          <span className="pill mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            Live on Arc Testnet · Chain 5042002
          </span>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Get paid in USDC with{" "}
            <span className="text-gradient">a single link.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-haze">
            No wallet address to copy. No invoice software. No 2.9% + 30¢. Set
            an amount, share a link, and the money lands in your wallet — final
            in under a second on Arc, the Layer-1 by Circle.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/create" className="btn-primary px-6 py-3.5 text-base">
              Create a payment link
            </Link>
            <Link to="/docs" className="btn-ghost px-6 py-3.5 text-base">
              Read the docs
            </Link>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
            <Stat value="< 1s" label="Settlement" />
            <Stat value="0%" label="Platform fee" />
            <Stat value="USDC" label="Native gas" />
          </dl>
        </div>

        <div className="animate-fade-up [animation-delay:120ms]">
          <LinkPreviewCard />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-mono text-2xl font-semibold text-white">{value}</dt>
      <dd className="mt-1 text-xs uppercase tracking-wider text-haze">
        {label}
      </dd>
    </div>
  );
}

function LogosStrip() {
  return (
    <section className="border-y border-white/8 bg-ink-900/40">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-6 text-sm text-haze/70">
        <span className="text-xs uppercase tracking-widest text-haze/50">
          Built on
        </span>
        <span className="font-semibold text-white/80">Arc</span>
        <span className="font-semibold text-white/80">Circle USDC</span>
        <span className="font-semibold text-white/80">EVM</span>
        <span className="font-semibold text-white/80">viem · wagmi</span>
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

function HowItWorks() {
  return (
    <section className="container-page py-24">
      <SectionHeading
        kicker="How it works"
        title="Three steps from request to settled."
      />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="card p-7">
            <div className="font-mono text-sm text-mint">{s.n}</div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-haze">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const features = [
  {
    title: "Non-custodial by design",
    body: "Funds move directly between wallets. Plink never holds a balance and has no access to your money.",
  },
  {
    title: "Just a URL",
    body: "The whole payment request lives in the link. No backend, no database, nothing to go down.",
  },
  {
    title: "Gas paid in USDC",
    body: "Arc uses USDC as the native gas token, so payers never need a separate volatile coin to transact.",
  },
  {
    title: "Sub-second finality",
    body: "Arc finalizes blocks in under a second. The receipt and the funds arrive at the same moment.",
  },
  {
    title: "Open source",
    body: "MIT licensed end to end. Audit the contract, the link encoder, and the UI — or self-host the lot.",
  },
  {
    title: "Works everywhere",
    body: "Any injected wallet, any device. Share by link or QR and accept payments from anyone, anywhere.",
  },
];

function Features() {
  return (
    <section className="border-y border-white/8 bg-ink-900/30">
      <div className="container-page py-24">
        <SectionHeading
          kicker="Why Plink"
          title="A payment processor that gets out of the way."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bg-ink-850 p-7">
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-haze">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const rows = [
  ["Settlement time", "2–5 business days", "Under 1 second"],
  ["Platform fee", "2.9% + $0.30", "0% — pay gas only"],
  ["Custody", "Held by processor", "Wallet to wallet"],
  ["Onboarding", "KYC, approvals", "Connect a wallet"],
  ["Chargebacks", "Possible for months", "Final on settlement"],
];

function Compare() {
  return (
    <section className="container-page py-24">
      <SectionHeading
        kicker="Compare"
        title="Card rails are a promise. Plink is a transfer."
      />
      <div className="mt-12 overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-800 text-haze">
            <tr>
              <th className="px-6 py-4 font-medium"> </th>
              <th className="px-6 py-4 font-medium">Card processor</th>
              <th className="px-6 py-4 font-semibold text-mint">Plink on Arc</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, a, b], i) => (
              <tr
                key={label}
                className={i % 2 ? "bg-ink-850/60" : "bg-ink-850"}
              >
                <td className="px-6 py-4 font-medium text-white">{label}</td>
                <td className="px-6 py-4 text-haze">{a}</td>
                <td className="px-6 py-4 text-white">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="container-page pb-28">
      <div className="card relative overflow-hidden p-10 text-center sm:p-16">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:36px_36px] opacity-50 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your first link takes ten seconds.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-haze">
            Grab test USDC from the Circle faucet, create a link, and watch a
            payment settle live on Arc.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/create" className="btn-primary px-6 py-3.5 text-base">
              Create a payment link
            </Link>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost px-6 py-3.5 text-base"
            >
              Get test USDC
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-mint">
        {kicker}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
