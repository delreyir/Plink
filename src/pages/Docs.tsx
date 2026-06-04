import { USDC_ADDRESS, EXPLORER_URL } from "../lib/arc";

export function Docs() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-mint">
          Docs
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          How Plink works
        </h1>
        <p className="mt-3 text-haze">
          Plink turns a USDC payment request into a shareable URL. There is no
          backend and no custody — the link carries the request, and the payer's
          wallet does the transfer directly on Arc.
        </p>

        <Section title="The payment link">
          <p>
            Everything a payer needs is encoded into the URL query string. A
            link looks like this:
          </p>
          <Code>{`https://plink.xyz/pay?to=0x8a3f…c21d&amt=49.00&for=Logo%20design`}</Code>
          <ul className="mt-4 space-y-2 text-sm">
            <Li>
              <code>to</code> — the recipient wallet address (checksummed).
            </Li>
            <Li>
              <code>amt</code> — the amount of USDC, up to 6 decimals.
            </Li>
            <Li>
              <code>for</code> — an optional memo shown on the checkout.
            </Li>
          </ul>
        </Section>

        <Section title="Settlement">
          <p>
            When the payer taps pay, their wallet calls{" "}
            <code>transfer</code> on the USDC ERC-20 interface on Arc. Funds move
            wallet-to-wallet with no intermediary. Arc finalizes blocks in under
            a second, so the receipt and the funds arrive together.
          </p>
        </Section>

        <Section title="Network details">
          <Table
            rows={[
              ["Network", "Arc Testnet"],
              ["Chain ID", "5042002"],
              ["Gas token", "USDC (paid in USDC, not ETH)"],
              ["USDC (ERC-20)", USDC_ADDRESS],
              ["Decimals", "6 (ERC-20 interface)"],
              ["Explorer", EXPLORER_URL.replace("https://", "")],
              ["Min base fee", "20 Gwei"],
            ]}
          />
        </Section>

        <Section title="The PaymentRouter contract">
          <p>
            The default flow uses a plain USDC transfer, which needs no contract
            at all. For merchants who want on-chain reconciliation, Plink also
            ships an optional <code>PaymentRouter</code> contract: it tags each
            payment with a <code>linkId</code> and emits a{" "}
            <code>PaymentReceived</code> event you can index, with an optional
            app fee in basis points. See{" "}
            <code>contracts/src/PaymentRouter.sol</code> in the repo.
          </p>
        </Section>

        <Section title="Trust model">
          <ul className="space-y-2 text-sm">
            <Li>Plink never holds funds — it cannot move your money.</Li>
            <Li>No accounts, no KYC, no API keys on either side.</Li>
            <Li>The whole app is static; the link is the source of truth.</Li>
            <Li>MIT licensed end to end — audit or self-host it.</Li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-haze">{children}</div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl border border-white/8 bg-ink-900/80 p-4 font-mono text-xs text-mint-soft">
      {children}
    </pre>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-mint" />
      <span>{children}</span>
    </li>
  );
}

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/8">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={k} className={i % 2 ? "bg-ink-850/60" : "bg-ink-850"}>
              <td className="px-4 py-3 font-medium text-white">{k}</td>
              <td className="break-all px-4 py-3 font-mono text-xs text-haze">
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
