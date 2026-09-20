# Legacy Gemini CLI context

Gemini CLI consumer access has transitioned to Antigravity CLI. This file is
intentionally a no-op so Antigravity does not load the full project instructions
twice when it reads both AGENTS.md and GEMINI.md.

Use AGENTS.md and the Antigravity skill entrypoint instead.
 
## Tooling Mandate: Browser MCP
- Any web browsing, job portal inspection, or application action (Wanted, Saramin, JobKorea, Wishket, Freemoa, etc.) MUST directly call the native MCP tool `call_mcp_tool` with `ServerName: "browsermcp"` (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_wait`, `browser_screenshot`).
- NEVER execute bash/node runner scripts (e.g. `browsermcp-runner.cjs`), python scripts, selenium, or DevTools console JS injection. Always invoke `browsermcp` directly via `call_mcp_tool`.
