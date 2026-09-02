# Kershell instructions for Claude

Use `AGENTS.md` as the canonical project rules file and follow it completely.

Project-specific skills are exposed under `.claude/skills`. Each Claude skill
routes to the matching canonical skill under `.agents/skills`, so changes to
engineering policy have one source of truth.

Before implementing the platform refactor, read the approved
`docs/spec-platform.md`. Treat `docs/spec-google-workspace-auth.md` as a
superseded historical proposal; ADR-004 is the accepted auth decision.
