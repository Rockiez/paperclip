import type { AdapterUsageCheckpoint } from "@paperclipai/adapter-utils";
import { priceAnthropicReceipt } from "./anthropic-pricing.js";
import { knownRunCostCents } from "./budget-exposure.js";
import { priceCodexReceipt } from "./codex-pricing.js";

/** Live admission can use a reviewed rate-card estimate before a receipt is
 * final. The original receipt stays incomplete/unpriced for ledger settlement. */
export function liveRunUsageCostCents(receipt: AdapterUsageCheckpoint): string | null {
  const reported = knownRunCostCents({ ...receipt, usageSource: receipt.usageBasis });
  if (reported !== null) return reported;
  if (receipt.usageBasis !== "per_run") return null;
  const projection = priceAnthropicReceipt(priceCodexReceipt({ ...receipt, complete: true }));
  return knownRunCostCents({ ...projection, usageSource: projection.usageBasis });
}
