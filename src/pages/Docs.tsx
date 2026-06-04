import {
  USDC_ADDRESS,
  EXPLORER_URL,
  PAYMENT_ROUTER_ADDRESS,
  PAYMENT_ROUTER_FEE_BPS,
  explorerAddress,
} from "../lib/arc";

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
          backend and no custody. The link carries the request, and the payer's
          wallet settles it on Arc through an open <code>PaymentRouter</code>{" "}
          contract.
        </p>

        <Section title="The payment link">
          <p>
            Everything a payer needs is encoded into the URL query string. A
            link looks like this:
          </p>
          <Code>{`https://plink.xyz/pay?to=0x8a3f…c21d&amt=49.00&for=Logo%20design`}</Code>
          <ul className="mt-4 space-y-2 text-sm">
            <Li>
              <code>to</code>: the recipient wallet address (checksummed).
            </Li>
            <Li>
              <code>amt</code>: the amount of USDC, up to 6 decimals.
            </Li>
            <Li>
              <code>for</code>: an optional memo shown on the checkout.
            </Li>
          </ul>
        </Section>

        <Section title="Settlement flow">
          <p>
            Paying a link is a two-step on-chain flow. Both steps run from the
            payer's wallet on Arc.
          </p>
          <ol className="mt-3 space-y-2 text-sm">
            <Li>
              <strong className="text-white">Approve.</strong> The payer
              approves the <code>PaymentRouter</code> for the amount of USDC.
            </Li>
            <Li>
              <strong className="text-white">Pay.</strong> The payer calls{" "}
              <code>pay(linkId, to, amount)</code>. The router pulls the gross
              amount, sends the net to the recipient, and forwards the
              protocol fee to the fee recipient, all in one transaction.
            </Li>
          </ol>
          <Code>{`payer ──approve(amount)──▶ USDC
payer ──pay(linkId, to, amount)──▶ PaymentRouter
                                       │
                                       ├─ safeTransferFrom(payer → router, amount)
                                       ├─ safeTransfer(router → recipient, net)
                                       ├─ safeTransfer(router → feeRecipient, fee)
                                       └─ emit PaymentReceived(linkId, payer, recipient, amount, fee)`}</Code>
          <p className="mt-3">
            Arc finalizes blocks in under a second, so the receipt and the
            funds arrive together.
          </p>
        </Section>

        <Section title="Protocol fee">
          <p>
            The router charges a flat protocol fee, set in basis points at
            deploy time and capped at <code>200</code> bps (2%). The fee is
            split off the gross amount inside <code>pay()</code> and forwarded
            to the fee recipient in the same transaction.
          </p>
          <Table
            rows={[
              ["Fee", `${PAYMENT_ROUTER_FEE_BPS} bps (${PAYMENT_ROUTER_FEE_BPS / 100}%)`],
              ["Cap", "200 bps (2%)"],
              ["Mutability", "Immutable, set in constructor"],
            ]}
          />
          <p className="mt-3 text-sm">
            Example: a <code>50.00 USDC</code> payment with a 1% fee sends{" "}
            <code>49.50 USDC</code> to the recipient and <code>0.50 USDC</code>{" "}
            to the fee recipient. The payer's wallet is debited{" "}
            <code>50.00 USDC</code> plus a few millicents of gas.
          </p>
        </Section>

        <Section title="linkId">
          <p>
            Each payment is tagged with a deterministic <code>linkId</code>{" "}
            (bytes32) so the on-chain <code>PaymentReceived</code> event can
            be reconciled back to a specific link.
          </p>
          <Code>{`linkId = keccak256(abi.encodePacked(to, amountBaseUnits, label))`}</Code>
          <p className="mt-3 text-sm">
            The same recipient + amount + label always produces the same id,
            and the id is computed client-side from the URL params. No
            registration, no database.
          </p>
        </Section>

        <Section title="Deployments (Arc Testnet)">
          <Table
            rows={[
              [
                "PaymentRouter",
                PAYMENT_ROUTER_ADDRESS,
              ],
              [
                "USDC (ERC-20)",
                USDC_ADDRESS,
              ],
              ["Network", "Arc Testnet"],
              ["Chain ID", "5042002"],
              [
                "Protocol fee",
                `${PAYMENT_ROUTER_FEE_BPS} bps (${PAYMENT_ROUTER_FEE_BPS / 100}%)`,
              ],
            ]}
          />
          <p className="mt-3 text-sm">
            Inspect the live contract on{" "}
            <a
              className="text-mint underline-offset-4 hover:underline"
              href={explorerAddress(PAYMENT_ROUTER_ADDRESS)}
              target="_blank"
              rel="noreferrer"
            >
              Arcscan
            </a>
            . Source:{" "}
            <a
              className="text-mint underline-offset-4 hover:underline"
              href="https://github.com/delreyir/Plink/blob/main/contracts/src/PaymentRouter.sol"
              target="_blank"
              rel="noreferrer"
            >
              <code>contracts/src/PaymentRouter.sol</code>
            </a>
            .
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

        <Section title="Trust model">
          <ul className="space-y-2 text-sm">
            <Li>
              Non-custodial. The router never holds a balance between calls;
              the payer pays, the recipient and fee recipient receive, all in
              one transaction.
            </Li>
            <Li>
              Immutable. The router has no admin, no upgrade path, and the fee
              is fixed at deploy.
            </Li>
            <Li>No accounts, no KYC, no API keys on either side.</Li>
            <Li>The frontend is static; the link is the source of truth.</Li>
            <Li>MIT licensed end to end. Audit or self-host it.</Li>
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
