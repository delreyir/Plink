// Compile PaymentRouter.sol and deploy it to Arc Testnet using viem.
// Usage:
//   node contracts/scripts/deploy.mjs            # feeBps=0, fee recipient = deployer
//   FEE_BPS=50 node contracts/scripts/deploy.mjs # 0.5% fee to deployer

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseGwei,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const solc = require("solc");

const ARC = {
  id: 5042002,
  name: "Arc Testnet",
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
};
const USDC = "0x3600000000000000000000000000000000000000";

// ---------- 1. Load deployer key ----------
const deployerPath = resolve(__dirname, "..", ".deployer.json");
const { privateKey } = JSON.parse(readFileSync(deployerPath, "utf8"));
const account = privateKeyToAccount(privateKey);
console.log("Deployer:", account.address);

// ---------- 2. Compile PaymentRouter.sol ----------
const root = resolve(__dirname, "..");
const ozRoot = resolve(__dirname, "..", "..", "node_modules", "@openzeppelin", "contracts");

function readSource(rel, base = root) {
  return readFileSync(resolve(base, rel), "utf8");
}

// solc requires every imported file. We resolve OpenZeppelin imports from the
// installed @openzeppelin/contracts package and remap the import path.
function findImport(importPath) {
  try {
    if (importPath.startsWith("openzeppelin-contracts/")) {
      const sub = importPath.slice("openzeppelin-contracts/".length);
      return { contents: readFileSync(resolve(ozRoot, sub), "utf8") };
    }
    return { error: "File not found: " + importPath };
  } catch (e) {
    return { error: e.message };
  }
}

const input = {
  language: "Solidity",
  sources: {
    "PaymentRouter.sol": { content: readSource("src/PaymentRouter.sol") },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object"] },
    },
  },
};

console.log("Compiling PaymentRouter.sol with solc", solc.version());
const output = JSON.parse(
  solc.compile(JSON.stringify(input), { import: findImport })
);

if (output.errors) {
  const fatal = output.errors.filter((e) => e.severity === "error");
  for (const e of output.errors) console.log(e.formattedMessage ?? e.message);
  if (fatal.length) {
    console.error("Compilation failed.");
    process.exit(1);
  }
}

const contract = output.contracts["PaymentRouter.sol"]["PaymentRouter"];
const abi = contract.abi;
const bytecode = "0x" + contract.evm.bytecode.object;
console.log("Bytecode size:", (bytecode.length - 2) / 2, "bytes");

// ---------- 3. Deploy ----------
const transport = http(ARC.rpcUrls.default.http[0]);
const publicClient = createPublicClient({ chain: ARC, transport });
const walletClient = createWalletClient({ account, chain: ARC, transport });

const feeBps = Number(process.env.FEE_BPS ?? 0);
if (feeBps < 0 || feeBps > 200) {
  console.error("FEE_BPS must be between 0 and 200 (0% to 2%).");
  process.exit(1);
}
const feeRecipient = process.env.FEE_RECIPIENT || account.address;

console.log("\nDeploy parameters:");
console.log("  token (USDC):  ", USDC);
console.log("  feeRecipient:  ", feeRecipient);
console.log("  feeBps:        ", feeBps);
console.log("  chain:         ", ARC.name, "(" + ARC.id + ")");

console.log("\nSending deploy transaction...");
const hash = await walletClient.deployContract({
  abi,
  bytecode,
  args: [USDC, feeRecipient, feeBps],
  // Arc requires at least 20 Gwei base fee.
  maxFeePerGas: parseGwei("25"),
  maxPriorityFeePerGas: parseGwei("1"),
});
console.log("Deploy tx:", hash);
console.log("  https://testnet.arcscan.app/tx/" + hash);

console.log("Waiting for confirmation...");
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success" || !receipt.contractAddress) {
  console.error("Deploy reverted. Receipt:", receipt);
  process.exit(1);
}

console.log("\n✅ PaymentRouter deployed!");
console.log("  address:    ", receipt.contractAddress);
console.log("  block:      ", receipt.blockNumber.toString());
console.log("  gas used:   ", receipt.gasUsed.toString());
console.log(
  "  explorer:   https://testnet.arcscan.app/address/" + receipt.contractAddress
);

// ---------- 4. Save deployment record ----------
const record = {
  network: ARC.name,
  chainId: ARC.id,
  address: receipt.contractAddress,
  deployer: account.address,
  feeRecipient,
  feeBps,
  token: USDC,
  txHash: hash,
  blockNumber: Number(receipt.blockNumber),
  deployedAt: new Date().toISOString(),
};
const deploymentsPath = resolve(root, "deployments.arc-testnet.json");
writeFileSync(deploymentsPath, JSON.stringify(record, null, 2));
console.log("\nDeployment record saved to:", deploymentsPath);
