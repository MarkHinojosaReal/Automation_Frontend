#!/usr/bin/env node
/**
 * Beads → Linear one-way sync.
 *
 * Reads .beads/issues.jsonl, fetches existing Linear issues for the project,
 * then creates / updates / closes to keep Linear in sync.
 *
 * Matching is done via bead ID embedded in the Linear issue title: "[atfe-xxx] ..."
 *
 * Environment variables (all required):
 *   LINEAR_API_KEY   – Personal or workspace API key
 *   LINEAR_TEAM_ID   – Team UUID
 *   LINEAR_PROJECT_ID – Project UUID
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = process.env.LINEAR_TEAM_ID;
const PROJECT_ID = process.env.LINEAR_PROJECT_ID;

if (!API_KEY || !TEAM_ID || !PROJECT_ID) {
  console.error('Missing required env vars: LINEAR_API_KEY, LINEAR_TEAM_ID, LINEAR_PROJECT_ID');
  process.exit(1);
}

// ─── Linear mappings ───

const PRIORITY_MAP = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 4 };

const LABEL_CACHE = {};
let STATE_CACHE = {};

async function gql(query, variables = {}) {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: API_KEY },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

async function loadTeamMeta() {
  const data = await gql(`{
    team(id: "${TEAM_ID}") {
      labels { nodes { id name } }
      states { nodes { id name type } }
    }
  }`);
  for (const l of data.team.labels.nodes) LABEL_CACHE[l.name.toLowerCase()] = l.id;
  for (const s of data.team.states.nodes) STATE_CACHE[s.type] = s.id;

  const statesByName = {};
  for (const s of data.team.states.nodes) statesByName[s.name.toLowerCase()] = s.id;
  STATE_CACHE = { ...STATE_CACHE, byName: statesByName };
}

async function fetchLinearIssues() {
  const issues = [];
  let hasMore = true;
  let after = null;

  while (hasMore) {
    const afterClause = after ? `, after: "${after}"` : '';
    const data = await gql(`{
      project(id: "${PROJECT_ID}") {
        issues(first: 100${afterClause}) {
          nodes { id identifier title description state { name type } priority }
          pageInfo { hasNextPage endCursor }
        }
      }
    }`);
    issues.push(...data.project.issues.nodes);
    hasMore = data.project.issues.pageInfo.hasNextPage;
    after = data.project.issues.pageInfo.endCursor;
  }
  return issues;
}

function extractBeadId(title) {
  const match = title.match(/^\[(atfe-\w+)\]/);
  return match ? match[1] : null;
}

function mapLabel(issueType) {
  if (issueType === 'bug') return LABEL_CACHE['bug'];
  if (issueType === 'feature') return LABEL_CACHE['feature'];
  return LABEL_CACHE['task'] || LABEL_CACHE['improvement'];
}

function mapBeadStatusToStateId(bead) {
  if (bead.status === 'closed') return STATE_CACHE.byName['done'] || STATE_CACHE['completed'];
  if (bead.status === 'in_progress') return STATE_CACHE.byName['in progress'] || STATE_CACHE['started'];
  return STATE_CACHE.byName['todo'] || STATE_CACHE['unstarted'];
}

function beadStatusLabel(bead) {
  if (bead.status === 'closed') return 'Done';
  if (bead.status === 'in_progress') return 'In Progress';
  return 'Todo';
}

function buildDescription(bead) {
  const lines = [
    `**Bead ID:** \`${bead.id}\``,
    `**Type:** ${bead.issue_type || 'task'}`,
    `**Priority:** P${bead.priority}`,
    `**Status:** ${bead.status}`,
    bead.owner ? `**Owner:** ${bead.owner}` : '',
    bead.created_by ? `**Created by:** ${bead.created_by}` : '',
    bead.close_reason && bead.close_reason !== 'Closed'
      ? `**Close reason:** ${bead.close_reason}`
      : '',
    bead.description ? `\n---\n\n${bead.description}` : '',
  ];
  return lines.filter(Boolean).join('\n');
}

function needsUpdate(linearIssue, bead) {
  const expectedTitle = `[${bead.id}] ${bead.title}`;
  const expectedStateId = mapBeadStatusToStateId(bead);
  const expectedPriority = PRIORITY_MAP[bead.priority] ?? 3;

  const currentStateId =
    STATE_CACHE.byName[linearIssue.state.name.toLowerCase()] || null;

  if (linearIssue.title !== expectedTitle) return true;
  if (currentStateId !== expectedStateId) return true;
  if (linearIssue.priority !== expectedPriority) return true;
  return false;
}

// ─── Main sync ───

async function main() {
  const jsonlPath = resolve(process.env.BEADS_PATH || '.beads/issues.jsonl');
  const raw = readFileSync(jsonlPath, 'utf-8');
  const beads = raw
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));

  console.log(`Loaded ${beads.length} beads from ${jsonlPath}`);

  await loadTeamMeta();
  const linearIssues = await fetchLinearIssues();
  console.log(`Found ${linearIssues.length} existing Linear issues\n`);

  const linearByBeadId = {};
  for (const li of linearIssues) {
    const beadId = extractBeadId(li.title);
    if (beadId) linearByBeadId[beadId] = li;
  }

  let created = 0, updated = 0, skipped = 0, failed = 0;

  for (const bead of beads) {
    const existing = linearByBeadId[bead.id];

    if (existing) {
      if (!needsUpdate(existing, bead)) {
        skipped++;
        continue;
      }

      try {
        const stateId = mapBeadStatusToStateId(bead);
        const priority = PRIORITY_MAP[bead.priority] ?? 3;
        const title = `[${bead.id}] ${bead.title}`;

        await gql(
          `mutation($id: String!, $input: IssueUpdateInput!) {
            issueUpdate(id: $id, input: $input) { success issue { identifier } }
          }`,
          {
            id: existing.id,
            input: { title, stateId, priority },
          }
        );
        console.log(`  ~ ${existing.identifier} updated (${beadStatusLabel(bead)})`);
        updated++;
      } catch (err) {
        console.error(`  ! ${bead.id} update failed: ${err.message}`);
        failed++;
      }
    } else {
      try {
        const title = `[${bead.id}] ${bead.title}`;
        const description = buildDescription(bead);
        const stateId = mapBeadStatusToStateId(bead);
        const priority = PRIORITY_MAP[bead.priority] ?? 3;
        const labelId = mapLabel(bead.issue_type);

        const result = await gql(
          `mutation($input: IssueCreateInput!) {
            issueCreate(input: $input) { success issue { identifier url } }
          }`,
          {
            input: {
              teamId: TEAM_ID,
              projectId: PROJECT_ID,
              title,
              description,
              stateId,
              priority,
              ...(labelId ? { labelIds: [labelId] } : {}),
            },
          }
        );
        console.log(`  + ${result.issueCreate.issue.identifier} created -> ${result.issueCreate.issue.url}`);
        created++;
      } catch (err) {
        console.error(`  ! ${bead.id} create failed: ${err.message}`);
        failed++;
      }
    }

    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nSync complete: ${created} created, ${updated} updated, ${skipped} unchanged, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
