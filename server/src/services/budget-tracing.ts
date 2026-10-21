import { getStartupTracer } from "../instrumentation.js";

/** Operator-gated OpenTelemetry only; these spans contain no prompt, receipt,
 * credential, or provider error text. Diagnostics never change accounting. */
export async function withBudgetSpan<T>(name: string, work: () => Promise<T>, attributes?: Record<string, number | boolean>) {
  const span = getStartupTracer("paperclip.budgets").startSpan(name, { attributes });
  try { return await work(); }
  finally { span.end(); }
}
