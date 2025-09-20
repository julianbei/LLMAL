## LLMAL Policy for Agents

We use LLMAL blocks (annotations in comments) to fence off critical code, record intent, and force explicit cleanups.

**Non-negotiable rules**
- Do NOT modify regions with `Protect.level = final|frozen` unless the instruction includes the word **Force**.
- When Force is used, you MUST also update annotations by adding at least one of:
  - `Purpose` (updated summary/spec link),
  - `OpenTasks` (concrete follow-ups),
  - `NeedsTests` (state edge cases to test).
- Keep all `@LLMAL` blocks intact; do not reflow or remove them.
- Respect `Contract.stability = stable` unless Force is present and justified in `Purpose`.

**Operating procedure**
1. Parse LLMAL blocks in files you plan to touch.
2. Limit edits to the requested scope; avoid "helpful" changes outside it.
3. If a change touches `KnownBug` or `KnownRegression`, add tests or link a ticket.
4. If any `SecuritySensitive` or `PerfCritical` annotations are present, minimize diff size.
5. Emit a short “ChangeLog for Reviewers” and mention the LLMAL updates you made.

**Example Force in PR body**


Force: true
Reason: must unblock release, adding tests afterward


