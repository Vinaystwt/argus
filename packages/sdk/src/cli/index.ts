#!/usr/bin/env node

import { runHash } from "./commands/hash.js";
import { runVerify } from "./commands/verify.js";
import { runInspect } from "./commands/inspect.js";
import { runContracts } from "./commands/contracts.js";
import { runExplain } from "./commands/explain.js";

function parseArgs(argv: string[]): { command: string; positional: string[]; flags: Record<string, string> } {
  const [, , command = "help", ...rest] = argv;
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (!arg) continue;
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = "true";
      }
    } else {
      positional.push(arg);
    }
  }

  return { command, positional, flags };
}

function printHelp(): void {
  console.log(`
argus — Argus proof verification CLI

Usage:
  argus hash <file>                      Compute trace root from JSON trace file
  argus verify <file> [--root <hex>]     Verify trace root matches committed root
  argus inspect <file>                   Display proof package fields
  argus contracts [--network <network>]  List deployed contract addresses
  argus explain <file>                   Explain violation in proof package

Options:
  --root <hex>        Committed trace root to verify against
  --network <name>    Network name (default: 0g-mainnet)

Examples:
  argus hash trace.json
  argus verify trace.json --root 0xb81c626b...
  argus inspect proof.json
  argus contracts --network 0g-mainnet
  argus explain proof.json
`);
}

const { command, positional, flags } = parseArgs(process.argv);

switch (command) {
  case "hash":
    runHash(positional);
    break;
  case "verify":
    runVerify(positional, flags);
    break;
  case "inspect":
    runInspect(positional);
    break;
  case "contracts":
    runContracts(flags);
    break;
  case "explain":
    runExplain(positional);
    break;
  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
