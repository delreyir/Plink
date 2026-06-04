import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 text-white ${className}`}
    >
      <svg width="30" height="30" viewBox="0 0 64 64" fill="none" aria-hidden>
        <rect width="64" height="64" rx="16" fill="#0e1118" />
        <rect
          x="0.6"
          y="0.6"
          width="62.8"
          height="62.8"
          rx="15.4"
          stroke="#5ef2b0"
          strokeOpacity="0.25"
          strokeWidth="1.2"
        />
        <path
          d="M26 18h9a11 11 0 0 1 0 22h-4v6h-5V18Zm5 5v12h4a6 6 0 0 0 0-12h-4Z"
          fill="#5ef2b0"
        />
      </svg>
      <span className="text-lg font-bold tracking-tight">plink</span>
    </Link>
  );
}
