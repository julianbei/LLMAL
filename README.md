# LLMAL — LLM Annotation Language

> Minimal, language-agnostic annotations that live in code comments to protect critical code, communicate intent, and make LLM-driven edits safer.

## Why this exists (no fluff)
- LLM/codegen **changes adjacent code** and reintroduces regressions.
- Reviewers waste time guessing **intent** behind fragile pieces.
- CI rarely **fails** on “policy” violations (e.g., touching a hot path).

**LLMAL** is a tiny, machine-readable block in comments (JSON by default, YAML optional) that lets humans and bots collaborate on safe change:
- Mark sections as **Protect: final/frozen/guarded**.
- Declare **Spike**, **KnownBug**, **KnownRegression**, **NeedsTests**, **NeedsDecomposition**.
- Document **Purpose/spec** and **OpenTasks** right where work happens.
- Enforce **Force** semantics: protected edits require an explicit Force signal **and** cleanup/explain annotations in the same change.

## 60‑second example (TypeScript)
```ts
/**
 * @LLMAL
 * {
 *   "scope": "function",
 *   "id": "calculatePrice",
 *   "annotations": [
 *     { "type": "Protect", "level": "final", "reason": "EU VAT rounding is brittle" },
 *     { "type": "Purpose", "summary": "Compute price incl. VAT", "spec": "docs/pricing.md#vat" },
 *     { "type": "KnownRegression", "items": ["DE rounding 2023-Q4", "coupon stacking"] },
 *     { "type": "NeedsTests", "why": "Currencies without minor units" }
 *   ]
 * }
 * @LLMAL:END
 */
export function calculatePrice(...) { ... }
```

**Rules:** If this function changes, CI fails unless the PR description contains `Force: true` and the diff adds `Purpose/OpenTasks/NeedsTests` annotations nearby.

## Repo map
```
llmal/
├─ README.md                 # Overview + quick start
├─ SPEC.md                   # Grammar, scoping, schema, Force rules
├─ ANNOTATIONS.md            # Canonical annotation types & fields
├─ CI.md                     # GitHub Action + checker script
├─ INTEGRATIONS.md           # How to wire LLMs, editors, bots
├─ TOOLING.md                # Pre-commit, local checks, editor ideas
├─ FAQ.md                    # Sharp questions, blunt answers
├─ CONTRIBUTING.md           # How to extend the language
├─ tools/
│  └─ llmal-check.js         # Minimal CI checker (Node 18+)
└─ .github/workflows/
   └─ llmal.yml              # GitHub Action wiring
```

## Quick start
1. Drop an `@LLMAL` block above code you care about.
2. Add the GitHub Action from `CI.md` to your repo.
3. Tell engineers & codegen tools: **do not touch `Protect: final/frozen` without Force**.

## Design stance
- **Parseable > pretty.** JSON wins by default. YAML optional.
- **Small surface, high leverage.** Start with core annotations; resist bloat.
- **Fail loudly.** If you break the rules, CI stops you.
- **LLM-aware.** Pre-prompt models with extracted LLMAL; they behave.

## License
MIT — pragmatic and permissive.
