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
2. **Stage only the files you worked on** with `git add <file>` — do not stage unrelated changes
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

- Agents **stage** only the files they worked on during the task — do not stage unrelated changes
- Agents **never commit** — the user retains full control of commits
- Run `bd sync` to sync beads changes with git when appropriate

## Linear Sync

Beads issues are **automatically synced to Linear** when `.beads/issues.jsonl` is pushed to `main`. The GitHub Action (`.github/workflows/sync-beads-linear.yml`) runs `scripts/sync-beads-linear.mjs` which:

- Creates new Linear issues for any beads not yet in Linear
- Updates title, status, and priority for changed beads
- Matches beads to Linear issues via the `[atfe-xxx]` prefix in the title

**No developer action required** — just use `bd` commands normally and push. Linear stays in sync.

### Required GitHub Secrets

These must be set in the repo's Settings → Secrets → Actions:

| Secret | Value |
|---|---|
| `LINEAR_API_KEY` | Linear API key (starts with `lin_api_`) |
| `LINEAR_TEAM_ID` | `155172ea-9958-4cb8-866f-ce585daa3b53` |
| `LINEAR_PROJECT_ID` | `9bc633c0-0ae5-43e8-adbb-62e06bf18c3e` |

### Manual Sync

To trigger a sync without pushing, use the "Run workflow" button on the Actions tab (workflow_dispatch is enabled).

## Dev and Production

**Any changes made to dev (e.g. `server/proxy.js`) must also be made to prod (e.g. `server/production-server.js`).** Keep dev and production code in sync—do not update one without updating the other.

<!-- gitnexus:start -->
# GitNexus MCP

This project is indexed by GitNexus as **Automation Ops Frontend** (328 symbols, 626 relationships, 23 execution flows).

GitNexus provides a knowledge graph over this codebase — call chains, blast radius, execution flows, and semantic search.

## Always Start Here

For any task involving code understanding, debugging, impact analysis, or refactoring, you must:

1. **Read `gitnexus://repo/{name}/context`** — codebase overview + check index freshness
2. **Match your task to a skill below** and **read that skill file**
3. **Follow the skill's workflow and checklist**

> If step 1 warns the index is stale, run `npx gitnexus analyze` in the terminal first.

## Skills

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/refactoring/SKILL.md` |

## Tools Reference

| Tool | What it gives you |
|------|-------------------|
| `query` | Process-grouped code intelligence — execution flows related to a concept |
| `context` | 360-degree symbol view — categorized refs, processes it participates in |
| `impact` | Symbol blast radius — what breaks at depth 1/2/3 with confidence |
| `detect_changes` | Git-diff impact — what do your current changes affect |
| `rename` | Multi-file coordinated rename with confidence-tagged edits |
| `cypher` | Raw graph queries (read `gitnexus://repo/{name}/schema` first) |
| `list_repos` | Discover indexed repos |

## Resources Reference

Lightweight reads (~100-500 tokens) for navigation:

| Resource | Content |
|----------|---------|
| `gitnexus://repo/{name}/context` | Stats, staleness check |
| `gitnexus://repo/{name}/clusters` | All functional areas with cohesion scores |
| `gitnexus://repo/{name}/cluster/{clusterName}` | Area members |
| `gitnexus://repo/{name}/processes` | All execution flows |
| `gitnexus://repo/{name}/process/{processName}` | Step-by-step trace |
| `gitnexus://repo/{name}/schema` | Graph schema for Cypher |

## Graph Schema

**Nodes:** File, Function, Class, Interface, Method, Community, Process
**Edges (via CodeRelation.type):** CALLS, IMPORTS, EXTENDS, IMPLEMENTS, DEFINES, MEMBER_OF, STEP_IN_PROCESS

```cypher
MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(f:Function {name: "myFunc"})
RETURN caller.name, caller.filePath
```

<!-- gitnexus:end -->
