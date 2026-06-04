import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { arcTestnet } from "../lib/arc";
import { shortAddress } from "../lib/link";

export function ConnectButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const injected = connectors[0];
  const wrongChain = isConnected && chainId !== arcTestnet.id;

  if (!isConnected) {
    return (
      <button
        className="btn-primary"
        disabled={isPending || !injected}
        onClick={() => injected && connect({ connector: injected })}
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  if (wrongChain) {
    return (
      <button
        className="btn-ghost border-amber-400/30 text-amber-300"
        onClick={() => switchChain({ chainId: arcTestnet.id })}
      >
        Switch to Arc Testnet
      </button>
    );
  }

  return (
    <button
      className="btn-ghost font-mono"
      onClick={() => disconnect()}
      title="Disconnect"
    >
      <span className="h-2 w-2 rounded-full bg-mint animate-pulseDot" />
      {shortAddress(address!)}
    </button>
  );
}
