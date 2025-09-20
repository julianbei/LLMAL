# Tooling

## Minimal parser heuristic
- Find lines containing `@LLMAL` and `@LLMAL:END`.
- Strip comment glyphs, parse JSON (or simple YAML if `format: yaml` present).
- Map block → effective line range by scope.
- Keep line numbers; CI reports must be precise.

## Region ends
Use an explicit end to bound large regions:
```
// @LLMAL
// { "scope": "region", "id": "Session.Auth", "annotations": [ { "type": "Protect", "level": "final" } ] }
// @LLMAL:END
... code ...
 // @LLMAL:REGION-END id=Session.Auth
```

## Style rules (linters/formatters)
- Preserve multi-line comment blocks with `@LLMAL`.
- Disallow duplicate `id` at same scope in one file.
