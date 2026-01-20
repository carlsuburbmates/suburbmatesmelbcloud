# Security Policy & Vulnerability Management

## Current Status (Jan 2026)

### Addressed
-   `ai`: Updated to `6.0.42`.
-   `@ai-sdk/react`: Updated to `3.0.44`.
-   `@modelcontextprotocol/sdk`: Pinned to `1.25.3` in root dependencies.

### Acceptable Risks (Dev-Only)

These vulnerabilities exist in **`devDependencies`** only and do not affect the deployed application (`npm run build` / `npm start` production). They pose risk to the *local development environment* or CI/CD runners, but not to end users.

| Package | Severity | Context | Risk Assessment |
| :--- | :--- | :--- |
| `@modelcontextprotocol/sdk` (nested) | HIGH | **ACCEPTED**. MCP servers bundle an older version (`v1.0.1`) inside their own `node_modules`. This vulnerability (DNS rebinding) is a ReDoS risk for the *developer*, not the application. The production code uses the secure `1.25.3` version. |
| `jsdiff` | LOW | **ACCEPTED**. Transitive dependency of `ts-node` (dev dependency). Used only in build scripts. No runtime exposure. |

### Why Not Fixed Now?
Updating these packages would require:
-   **`supabase/mcp-server-supabase`**: Update to `0.5.10` (Breaking change).
-   **Nested `node_modules`**: Cannot force MCP servers to use project's root SDK version due to their internal bundling.

### Mitigation Strategy
1.  **Isolation**: Use these tools only in local dev (not in production Docker containers).
2.  **Future Monitoring**: Watch for updates to `supabase/mcp-server-supabase` and `@stripe/mcp` that resolve the nested SDK issue.
3.  **Production Audit**: Continuously audit `dependencies` (not `devDependencies`) before deploying.
