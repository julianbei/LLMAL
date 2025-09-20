# Canonical Annotations

Each annotation is an object in the `annotations` array with `"type": "<Name>"`. Extra fields are allowed.

## Protection
### `Protect`
```json
{ "type": "Protect", "level": "final|frozen|guarded", "reason": "…", "until": "YYYY-MM-DD" }
```
- `final`: edits forbidden unless Force.
- `frozen`: time-bounded final.
- `guarded`: edits allowed; warn unless linked to ticket/spec.

## Quality intent
### `Spike`
```json
{ "type": "Spike", "owner":"@user", "note":"…", "deadline":"YYYY-MM-DD" }
```
### `NeedsDecomposition`
```json
{ "type": "NeedsDecomposition", "note":"split IO from domain" }
```
### `NeedsTests`
```json
{ "type": "NeedsTests", "why":"edge cases", "coverage":"lines|branches|critical-path" }
```
### `KnownBug`
```json
{ "type": "KnownBug", "summary":"race on Close()", "ticket":"ABC-123", "status":"new|triaged|in-progress" }
```
### `KnownRegression`
```json
{ "type": "KnownRegression", "items":["VAT rounding 2023-Q4"], "links":["…"] }
```

## Documentation / intent
### `Purpose`
```json
{ "type": "Purpose", "summary":"what this does", "spec":"docs/spec.md#anchor" }
```
### `OpenTasks`
```json
{ "type": "OpenTasks", "items":["add paging","handle 429 backoff"] }
```

## Strongly recommended
### `Contract`
```json
{ "type":"Contract", "stability":"stable|evolving|experimental", "breaking":false }
```
### `SecuritySensitive`
```json
{ "type":"SecuritySensitive", "reason":"auth/crypto", "reviewers":["@sec1","@sec2"] }
```
### `PerfCritical`
```json
{ "type":"PerfCritical", "budgetMs":5, "note":"hot path" }
```
### `Ownership`
```json
{ "type":"Ownership", "team":"platform", "codeowners":["@julian"] }
```
### `SideEffects`
```json
{ "type":"SideEffects", "effects":["writes DB", "sends emails"] }
```
### `FeatureFlag`
```json
{ "type":"FeatureFlag", "flag":"billing.v2", "state":"on|off|rollout" }
```
### `Deprecation`
```json
{ "type":"Deprecation", "replaceWith":"NewThing()", "removeAfter":"2025-12-31" }
```
