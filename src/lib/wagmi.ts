import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcTestnet } from "./arc";

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http("https://rpc.testnet.arc.network"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
