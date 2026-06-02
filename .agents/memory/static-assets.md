---
name: Static assets routing for attached_assets
description: How to serve images from attached_assets/ through the Replit proxy
---

# Static Assets Routing

## Rule
To serve files from `attached_assets/` at a URL path like `/assets/`, you need TWO changes:
1. Add `express.static(path.resolve(..., 'attached_assets'))` middleware in the API server's `app.ts`
2. Add `/assets` to the `paths` array in the API server's `artifact.toml` so the Replit proxy routes those requests to the API server

**Why:** The Replit proxy routes by path prefix. Without declaring `/assets` in `artifact.toml`, requests to `/assets/...` go to the frontend Vite server which doesn't know about those files.

**How to apply:**
- `app.use('/assets', express.static(path.resolve(import.meta.dirname, '..', '..', '..', 'attached_assets')))`
- In `artifacts/api-server/.replit-artifact/artifact.toml`: `paths = ["/api", "/assets"]`
- Use `verifyAndReplaceArtifactToml` to edit artifact.toml (direct edits are blocked)
