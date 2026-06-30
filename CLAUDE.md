# Unsung Bites — agent guide

## graphify: graph-first navigation

A knowledge graph of this repo lives in `graphify-out/` (`graph.json` + `GRAPH_REPORT.md`).
It's a **map of what connects to what** — not the source code itself.

**Before searching files to orient yourself**, consult the graph first to get a starting hypothesis:
- "what connects to X", "what depends on X", "where does the scan flow go", architecture/overview questions → query the graph.
- `/graphify query "<question>"` (broad), `/graphify path "A" "B"` (trace a chain), `/graphify explain "X"` (one node's connections), or just read `graphify-out/GRAPH_REPORT.md` for the map.

Then **read the actual files** to confirm. If the graph pointed somewhere wrong, the code will show it — change direction. The graph saves the *search*, not the *reading*: it does not contain source, so for code content or any edit you still open the file.

Use grep/Read directly (skip the graph) when you already know the file, or the question is about exact code, a bug fix, or a one-off lookup.

## Keeping the graph fresh

- **Code changes auto-update**: a git post-commit hook re-runs AST extraction on commit — zero tokens, no action needed.
- **Doc/spec/openapi changes**: the hook ignores these. After changing docs, run `/graphify --update` to re-extract (only changed files, cheap).
