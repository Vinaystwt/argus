import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { hashTrace, type DemoReceipt } from "@argus/shared";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const dataPath = join(repoRoot, "apps/web/public/demo-data.json");
const data = JSON.parse(readFileSync(dataPath, "utf8")) as DemoReceipt;
const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

function unique(values: string[], label: string) {
  const seen = new Set<string>();
  for (const value of values) {
    assert(!seen.has(value), `${label} is duplicated: ${value}`);
    seen.add(value);
  }
}

const agents = data.agents ?? [data.agent];
const mandates = data.mandates ?? [data.mandate];
const violations = data.violations ?? [];
const packages = data.proofPackages ?? [];
const agentIds = new Set(agents.map((agent) => agent.id));
const mandateIds = new Set(mandates.map((mandate) => mandate.id));
const traceRoots = new Set(data.traces.map((trace) => trace.proof.committedTraceRoot));
const traceIds = new Set(data.traces.map((trace) => trace.traceId));
const violationIds = new Set(violations.map((violation) => violation.violationId));

unique(data.traces.map((trace) => trace.traceId), "traceId");
unique(data.traces.map((trace) => trace.proof.committedTraceRoot), "trace root");
unique(packages.map((pkg) => pkg.packageId), "proof packageId");

for (const trace of data.traces) {
  assert(agentIds.has(trace.agentId), `trace ${trace.traceId} references missing agent ${trace.agentId}`);
  assert(mandateIds.has(trace.mandateId), `trace ${trace.traceId} references missing mandate ${trace.mandateId}`);
  assert(hashTrace(trace) === trace.proof.committedTraceRoot, `trace ${trace.traceId} root does not verify`);
  assert(
    packages.some((pkg) => pkg.traceRoot === trace.proof.committedTraceRoot && pkg.traceId === trace.traceId),
    `trace ${trace.traceId} has no matching proof package`
  );
}

for (const pkg of packages) {
  assert(traceRoots.has(pkg.traceRoot), `proof package ${pkg.packageId} references missing trace root`);
  assert(traceIds.has(pkg.traceId), `proof package ${pkg.packageId} references missing traceId`);
  assert(agentIds.has(pkg.agentId), `proof package ${pkg.packageId} references missing agent`);
  assert(mandateIds.has(pkg.mandateId), `proof package ${pkg.packageId} references missing mandate`);
  assert(pkg.verification.status === "valid", `proof package ${pkg.packageId} verification status is ${pkg.verification.status}`);
}

for (const violation of violations) {
  assert(traceRoots.has(violation.traceRoot), `violation ${violation.violationId} references missing trace root`);
  assert(agentIds.has(violation.agentId), `violation ${violation.violationId} references missing agent`);
  assert(mandateIds.has(violation.mandateId), `violation ${violation.violationId} references missing mandate`);
  assert(Boolean(violation.slashReceipt?.txHash), `violation ${violation.violationId} is missing slash receipt tx`);
}

for (const event of data.events) {
  if (event.agentId) assert(agentIds.has(event.agentId), `event ${event.id} references missing agent ${event.agentId}`);
  if (event.mandateId) assert(mandateIds.has(event.mandateId), `event ${event.id} references missing mandate ${event.mandateId}`);
  if (event.traceRoot) assert(traceRoots.has(event.traceRoot), `event ${event.id} references missing trace root`);
  if (event.violationId) assert(violationIds.has(event.violationId), `event ${event.id} references missing violation`);
}

for (const agent of agents) {
  const agentTraces = data.traces.filter((trace) => trace.agentId === agent.id);
  const approved = agentTraces.filter((trace) => trace.policyCheck.verdict === "APPROVED").length;
  const rejected = agentTraces.filter((trace) => trace.policyCheck.verdict === "REJECTED").length;
  assert((agent.approvedCount ?? approved) === approved, `agent ${agent.id} approvedCount does not match traces`);
  assert((agent.rejectedCount ?? rejected) === rejected, `agent ${agent.id} rejectedCount does not match traces`);
  const lastScore = agent.scoreHistory?.at(-1)?.score;
  if (lastScore !== undefined) assert(lastScore === agent.complianceScore, `agent ${agent.id} score history does not end at compliance score`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: "valid",
      agents: agents.length,
      mandates: mandates.length,
      traces: data.traces.length,
      violations: violations.length,
      proofPackages: packages.length,
      events: data.events.length
    },
    null,
    2
  )
);
