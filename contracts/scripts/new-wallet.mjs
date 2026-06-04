import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "..", ".deployer.json");

if (existsSync(outPath)) {
  const existing = JSON.parse(
    (await import("node:fs")).readFileSync(outPath, "utf8")
  );
  console.log("Existing deployer wallet found:");
  console.log("  address:", existing.address);
  console.log("\nDelete contracts/.deployer.json to generate a new one.");
  process.exit(0);
}

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify({ address: account.address, privateKey }, null, 2),
  { mode: 0o600 }
);

console.log("New deployer wallet created.");
console.log("  address:    ", account.address);
console.log("  saved to:   ", outPath);
console.log("\nNext steps:");
console.log("  1. Fund the address with test USDC from https://faucet.circle.com");
console.log("     (select Arc Testnet, paste the address above).");
console.log("  2. Run: node scripts/deploy.mjs");
