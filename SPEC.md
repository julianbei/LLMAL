# SPEC — LLM Annotation Language

## Block structure
An LLMAL block lives in comments. The parser looks for a line containing `@LLMAL`. The block ends at a line containing `@LLMAL:END`. Content is **JSON** by default; set `format: yaml` to use YAML.

### Generic form
```txt
<comment-open>
@LLMAL
{
  "scope": "file|class|function|region",
  "id": "stable-identifier-optional",
  "annotations": [ /* see ANNOTATIONS.md */ ],
  "format": "json"  // omit unless using yaml
}
@LLMAL:END
<comment-close>
```

### Region scoping
- `scope: "file"` applies to the entire file.
- `scope: "class" | "function"` applies to the next AST node beginning immediately after the block.
- `scope: "region"` applies from the end of the block to the next **explicit** end marker (recommended for large areas):
  ```
  // @LLMAL:REGION-END id=Session.Auth
  ```

### Multiple blocks & precedence
If overlapping blocks apply, protection precedence is:
`final > frozen > guarded`, otherwise **most specific scope wins** (function > class > file).

## Protection and Force
- `Protect.level = final|frozen|guarded`.
  - `final`: edits forbidden unless Force.
  - `frozen`: same as `final`, optionally **time-bounded** via `until: YYYY-MM-DD`.
  - `guarded`: edits allowed, but flagged unless the PR references a ticket/spec.
- **Force requirement**: When touching a protected (final/frozen) region:
  1. PR description must contain `Force: true` (or commit trailer `LLM-Force: true`), **and**
  2. The diff must **add or update** at least one of: `Purpose`, `OpenTasks`, `NeedsTests` in the same file/region.
- CI **fails** if (1) or (2) is missing.

## JSON Schema (machine validation)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "LLMAL Block",
  "type": "object",
  "required": ["scope", "annotations"],
  "properties": {
    "format": { "type": "string", "enum": ["json", "yaml"] },
    "scope": { "type": "string", "enum": ["file","class","function","region"] },
    "id": { "type": "string" },
    "annotations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type"],
        "properties": {
          "type": { "type": "string" },
          "level": { "type": "string", "enum": ["final","frozen","guarded"] },
          "reason": { "type": "string" },
          "until": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
          "owner": { "type": "string" },
          "deadline": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
          "summary": { "type": "string" },
          "ticket": { "type": "string" },
          "status": { "type": "string" },
          "items": { "type": "array", "items": { "type": "string" } },
          "links": { "type": "array", "items": { "type": "string" } },
          "spec": { "type": "string" },
          "why": { "type": "string" },
          "note": { "type": "string" },
          "coverage": { "type": "string" },
          "stability": { "type": "string" },
          "breaking": { "type": "boolean" },
          "budgetMs": { "type": "number" },
          "reviewers": { "type": "array", "items": { "type": "string" } },
          "effects": { "type": "array", "items": { "type": "string" } },
          "flag": { "type": "string" },
          "state": { "type": "string" },
          "replaceWith": { "type": "string" },
          "removeAfter": { "type": "string" }
        },
        "additionalProperties": true
      }
    }
  },
  "additionalProperties": true
}
```

## Parsing guidelines
- Ignore comment tokens; look only for delimiter lines.
- Be forgiving: accept extra fields; warn don’t fail.
- If a block cannot be parsed, CI should **warn** and treat it as non-protecting.
- Track `(file, startLine, endLine, scope, id, annotations[])` for reporting.

## Security & supply-chain notes
- Treat `Force` as a **policy gate**, not security. Malicious changes can still lie; require code owners for `final` regions.
- Store and surface `Ownership` annotations to enforce reviewer presence.
