import { useAccount, useReadContract } from "wagmi";
import { erc20Abi } from "../lib/abi";
import { USDC_ADDRESS } from "../lib/arc";
import { fromBaseUnits, formatUsd } from "../lib/link";

/** Live USDC balance for the connected wallet, read straight from the chain. */
export function UsdcBadge() {
  const { address, isConnected } = useAccount();

  const { data, isLoading } = useReadContract({
    abi: erc20Abi,
    address: USDC_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 8000 },
  });

  if (!isConnected) return null;

  return (
    <div className="pill">
      <span className="text-haze">Balance</span>
      <span className="font-mono text-white">
        {isLoading || data === undefined
          ? "…"
          : `${formatUsd(fromBaseUnits(data as bigint))} USDC`}
      </span>
    </div>
  );
}
