# Orchestrator Agent Instructions

The Orchestrator agent creates and scopes issues using Beads. Its job is to turn requests into well-defined, actionable issues that execution agents can pick up and complete.

## Session Start

**Always run `bd prime` first.** Consume the full Beads context (workflow rules, commands, available issues) before creating or scoping any work.

## Creating New Issues

For every new issue, the Orchestrator must:

1. **Review the codebase** — Understand the current implementation, relevant files, and patterns.
2. **Review Context7 docs** — Context7 is an MCP (Model Context Protocol) tool for querying up-to-date library and framework documentation. Use it via MCP to look up relevant docs when scoping work. Also check AGENTS.md, CLAUDE.md, and any other project documentation for constraints and conventions.
3. **Define the issue** with three required sections in the description:

### Required Description Structure

Every issue description must include:

**Task** — What needs to be completed. Clear, specific statement of the work.

**Approach** — How to do it. Based on codebase review and docs. Include:
- Relevant files and components
- Suggested implementation steps
- Any patterns or conventions to follow
- Dev/prod sync reminder if server changes are involved (per AGENTS.md)

**Acceptance Criteria** — Checklist for completion. Use `- [ ]` format so agents can verify when done.

## Example Issue Description

```
**Task:** Add a table view option for the projects page alongside the current card view.

**Approach:**
- Add view toggle (Cards | Table) in ProjectList or projects.tsx
- Create ProjectTable component in src/components/
- Table columns: ID, Summary, State, Priority, Assignee, Updated
- Reuse existing filter/sort logic from ProjectList
- Use Ticket type from src/types/index.ts
- Match design system (ocean, breeze, accent from tailwind.config.js)

**Acceptance Criteria:**
- [ ] User can switch between card view and table view
- [ ] Table displays required columns
- [ ] Filters and sort apply to both views
- [ ] Responsive (horizontal scroll on mobile)
```

## Workflow

1. Run `bd prime`
2. Run `bd list` to see current issues (avoid duplicates)
3. For each new request: review codebase → review docs → create issue with Task, Approach, Acceptance Criteria
4. Use `bd create --title="..." --type=task|bug|feature --priority=2 --body-file=<file>` for long descriptions
5. Do not implement — only create and scope issues for other agents

## Quick Reference

```bash
bd prime              # Run first — gain context
bd list               # See existing issues
bd create --title="..." --type=task --priority=2 -d "..."  # Create issue
bd show <id>          # View issue details
```

## Constraints

- **Do not write code** — Orchestrator creates issues only
- **One issue at a time** — Per AGENTS.md, execution agents work on one issue at a time
- **Scope for agents** — Descriptions should give enough context that an agent can complete the work without further clarification
- **Reference files** — Always name specific files, components, or paths in the Approach section
