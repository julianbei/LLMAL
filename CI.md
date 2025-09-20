# CI — Blocking the wrong changes

## GitHub Action
Add this workflow to your repo:

```yaml
name: llmal
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node tools/llmal-check.js --base "${{ github.event.pull_request.base.sha }}" --head "${{ github.event.pull_request.head.sha }}" --prBody "${{ github.event.pull_request.body }}"
```
Ensure `tools/llmal-check.js` is committed (see below).

## What the checker enforces
- Touching a `Protect: final|frozen` region **without** `Force: true` in the PR description → **fail**.
- Using Force but **not** adding `Purpose/OpenTasks/NeedsTests` in the diff → **fail**.
- Touching `guarded` regions → **warn** unless PR references a ticket/spec in description.

## Local pre-commit (optional)
Run the same script locally to fail fast:
```bash
node tools/llmal-check.js --base origin/main --head HEAD --prBody "$(git log -1 --pretty=%B)"
```
