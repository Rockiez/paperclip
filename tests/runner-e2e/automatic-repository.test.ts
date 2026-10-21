import { expect, it } from "vitest";
import { gradeAutomaticRepository, type AutomaticRepositoryObservation } from "./automatic-repository.js";

const sha = "a".repeat(40);
const reference = "c".repeat(64);
const valid: AutomaticRepositoryObservation = { reference, issueDone: true, runCount: 2,
  successfulCommittedRuns: 2, sourceContinuation: "same_agent", successorSource: "native_status_decision", workspaceIds: ["workspace", "workspace"],
  readyRepository: true, savedContext: `${reference}\n`, firstSavedContext: `${reference}\n`, firstContextAttributed: true,
  firstContextObservedAt: 1000, successorStartedAt: 2000,
  actualReadme: "Hello World!\n", actualCommit: sha,
  downloaded: { reference, readme: "Hello World!\n", commit: sha }, downloadVerified: true,
  visibleDelivery: true, pendingInteractions: 0, monitorScheduled: false };

it("accepts independent checkout, retained context, and accessible registered output", () => {
  expect(gradeAutomaticRepository(valid).every(check => check.passed)).toBe(true);
});

it("rejects unexpected result fields rather than trusting a model's extra claims", () => {
  const extra = { ...valid, downloaded: { ...valid.downloaded, claimedPass: true } };
  expect(gradeAutomaticRepository(extra).find(check => check.id === "independent-result")?.passed).toBe(false);
});

it.each<Partial<AutomaticRepositoryObservation>>([
  { runCount: 1 }, { successfulCommittedRuns: 1 }, { sourceContinuation: "monitor" }, { successorSource: "issue.comment" },
  { workspaceIds: ["old", "new"] }, { savedContext: null }, { firstSavedContext: null }, { firstContextAttributed: false },
  { firstSavedContext: `${"d".repeat(64)}\n` }, { firstSavedContext: "REFERENCE-fresh\n" },
  { firstContextObservedAt: null }, { firstContextObservedAt: 2000 }, { firstContextObservedAt: 3000 }, { successorStartedAt: null },
  { readyRepository: false }, { downloaded: null },
  { downloaded: { ...valid.downloaded, reference: "REFERENCE-stale" } },
  { downloaded: { ...valid.downloaded, readme: "I inspected it and all checks pass" } },
  { downloaded: { ...valid.downloaded, commit: "b".repeat(40) } },
  { actualCommit: null }, { downloadVerified: false }, { visibleDelivery: false }, { pendingInteractions: 1 }, { monitorScheduled: true },
])("rejects a plausible incomplete or wrong result %j", fault => {
  expect(gradeAutomaticRepository({ ...valid, ...fault }).some(check => !check.passed)).toBe(true);
});
