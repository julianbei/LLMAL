# Integrations — make tools behave

## LLM codegen
Before generating edits, extract LLMAL blocks for files in scope and prepend to the prompt:

> **Policy:** Do not edit sections marked `Protect: final|frozen`. If the human prompt contains the word `Force`, you may edit, but you must also add/update `Purpose` and `OpenTasks` or `NeedsTests` annotations near the edit.

Also instruct the model to **retain** `@LLMAL` blocks intact.

## PR bot
- Summarize changed annotations.
- Flag violations & expiring `frozen` blocks.
- Request owners from `Ownership` for protected edits.

## Editors
- Render badges for annotations (Protect, Spike, etc.).
- Offer snippets to insert blocks.
- Optional: fold protected regions to deter casual edits.
