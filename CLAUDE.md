# Kershell instructions for Claude

Use `AGENTS.md` as the canonical project rules file and follow it completely.

Project-specific skills are exposed under `.claude/skills`. Each Claude skill
routes to the matching canonical skill under `.agents/skills`, so changes to
engineering policy have one source of truth.

Before implementing the platform refactor, read `docs/spec-platform.md` and stop
for resolution of its open architecture questions. Do not treat the existing
Google Workspace auth proposal as accepted merely because it exists in the
working tree.
