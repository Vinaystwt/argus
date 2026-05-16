#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { hashTraceTool, handleHashTrace } from "./tools/hash-trace.js";
import { verifyTraceTool, handleVerifyTrace } from "./tools/verify-trace.js";
import { inspectProofTool, handleInspectProof } from "./tools/inspect-proof.js";
import { explainViolationTool, handleExplainViolation } from "./tools/explain-violation.js";
import { getContractsTool, handleGetContracts } from "./tools/get-contracts.js";
import { getDemoTransactionsTool, handleGetDemoTransactions } from "./tools/get-demo-transactions.js";
import { getStorageReceiptsTool, handleGetStorageReceipts } from "./tools/get-storage-receipts.js";

const server = new McpServer({
  name: "argus-mcp",
  version: "0.1.0",
});

// hash_trace
server.tool(
  hashTraceTool.name,
  hashTraceTool.description,
  { trace_json: z.string().describe("JSON string of the ArgusTrace object") },
  async ({ trace_json }) => {
    const result = handleHashTrace({ trace_json });
    return { content: [{ type: "text", text: result }] };
  }
);

// verify_trace
server.tool(
  verifyTraceTool.name,
  verifyTraceTool.description,
  {
    trace_json: z.string().describe("JSON string of the ArgusTrace object"),
    committed_root: z.string().optional().describe("The committed 0x-prefixed hex trace root to verify against"),
  },
  async ({ trace_json, committed_root }) => {
    const result = handleVerifyTrace({ trace_json, committed_root });
    return { content: [{ type: "text", text: result }] };
  }
);

// inspect_proof_package
server.tool(
  inspectProofTool.name,
  inspectProofTool.description,
  { package_json: z.string().describe("JSON string of the ProofPackage object") },
  async ({ package_json }) => {
    const result = handleInspectProof({ package_json });
    return { content: [{ type: "text", text: result }] };
  }
);

// explain_violation
server.tool(
  explainViolationTool.name,
  explainViolationTool.description,
  {
    proof_json: z.string().describe("JSON string of the ProofPackage object"),
    violation_bitmap: z.number().optional().describe("Optional raw violation bitmap integer to decode directly"),
  },
  async ({ proof_json, violation_bitmap }) => {
    const result = handleExplainViolation({ proof_json, violation_bitmap });
    return { content: [{ type: "text", text: result }] };
  }
);

// get_argus_contracts
server.tool(
  getContractsTool.name,
  getContractsTool.description,
  { network: z.string().optional().describe("Network name. Currently only '0g-mainnet' is supported.") },
  async ({ network }) => {
    const result = handleGetContracts({ network });
    return { content: [{ type: "text", text: result }] };
  }
);

// get_demo_transactions
server.tool(
  getDemoTransactionsTool.name,
  getDemoTransactionsTool.description,
  {},
  async () => {
    const result = handleGetDemoTransactions({});
    return { content: [{ type: "text", text: result }] };
  }
);

// get_storage_receipts
server.tool(
  getStorageReceiptsTool.name,
  getStorageReceiptsTool.description,
  {},
  async () => {
    const result = handleGetStorageReceipts({});
    return { content: [{ type: "text", text: result }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("Argus MCP server running on stdio\n");
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
