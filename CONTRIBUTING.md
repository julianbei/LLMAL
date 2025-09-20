# Contributing

- Keep the core surface small. Favor composite behavior over new annotation types.
- Any new *protection* level must come with clear CI semantics.
- Add examples and tests for each new field in `ANNOTATIONS.md` and `SPEC.md`.

## Dev tasks
- Add language-specific extractors (optional) to map blocks to AST nodes precisely.
- Build a VS Code extension for visual badges.
- Extend the checker to post PR comments with inline links to changed regions.
