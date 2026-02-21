# Agent Instructions

This project uses **bd** (beads) for issue tracking.

## Session Start

**All agents must run `bd prime`** at the start of a session to gain context for beads.

## Issue Workflow

**Agents shall only work on one issue at a time.** Do not start another issue until the current one is closed.

### When Assigned an Issue

Always change the issue status to in-progress:

```bash
bd update <id> --status=in_progress
```

### Before Closing an Issue

1. **Always run the build** (`npm run build`) to ensure no breaking changes were made.
2. **Prompt the user to test the changes** before closing. Do not close until the user has confirmed testing or explicitly approves.

### Closing an Issue

1. Close the issue: `bd close <id>`
2. **Stage changes for git** with `git add`
3. **Never commit** — only the user commits changes to git

## Quick Reference

```bash
bd prime              # Run first — gain beads context
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status=in_progress  # Claim work (do this when assigned)
bd close <id>         # Complete work (after user tests)
bd sync               # Sync beads with git
```

## Git Workflow

- Agents **stage** changes with `git add`
- Agents **never commit** — the user retains full control of commits
- Run `bd sync` to sync beads changes with git when appropriate
