# AI.md

This file defines how AI should operate when working in this repository.
Rules are added incrementally as real problems are discovered.

---

## Rule #1: Safe Documentation Mode (CRITICAL)

When asked to add or improve documentation in an existing file:

### Hard rules

- DO NOT rewrite or reprint the entire file.
- DO NOT change executable code unless explicitly instructed.
- DO NOT refactor, reformat, or reorder logic.
- Preserve all existing syntax, exports, and structure.

### Allowed changes ONLY

- Add or modify:
  - JSDoc / TSDoc comments
  - Block comments
  - Inline explanatory comments
- Comments must be attached to existing code, not recreated code.

### Output format

AI must:

1. Identify which parts of the file will receive documentation.
2. Show ONLY the modified snippets (diff-style or isolated blocks).
3. Explicitly state: “No functional code was changed.”

### Uncertainty rule

If documentation would require guessing or changing behavior:

- Ask for clarification first, OR
- Add a TODO comment instead of changing code.

### Failure handling

If the AI cannot confidently apply documentation without risking breakage:

- It must refuse and explain why.
