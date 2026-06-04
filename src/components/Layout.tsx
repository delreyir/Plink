import { Outlet, NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { ConnectButton } from "./ConnectButton";
import { EXPLORER_URL, FAUCET_URL } from "../lib/arc";

const navItems = [
  { to: "/create", label: "Create" },
  { to: "/docs", label: "Docs" },
];

export function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink-950/70 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "text-white"
                        : "text-haze hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="pill hidden sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              Arc Testnet
            </span>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/8">
        <div className="container-page flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <Logo />
            <p className="max-w-sm text-sm text-haze">
              Request USDC with a link. Non-custodial, open source, built on
              Arc — the Layer-1 by Circle.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <a
              className="text-haze transition hover:text-white"
              href="https://docs.arc.io"
              target="_blank"
              rel="noreferrer"
            >
              Arc Docs
            </a>
            <a
              className="text-haze transition hover:text-white"
              href={EXPLORER_URL}
              target="_blank"
              rel="noreferrer"
            >
              Explorer
            </a>
            <a
              className="text-haze transition hover:text-white"
              href={FAUCET_URL}
              target="_blank"
              rel="noreferrer"
            >
              Faucet
            </a>
          </div>
        </div>
        <div className="container-page pb-8 text-xs text-haze/60">
          © {new Date().getFullYear()} Plink · MIT licensed · Testnet preview,
          use test USDC only.
        </div>
      </footer>
    </div>
  );
}
