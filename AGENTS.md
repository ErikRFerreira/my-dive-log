# AI.md

This file defines how AI should operate when working in this repository.
Rules are added incrementally as real problems are discovered.

---

## Rule #1: Safe Documentation Mode (CRITICAL)

When asked to add or improve documentation in an existing file:

### Hard rules

- DO NOT rewrite or reprint the entire file.
- DO NOT change executable code unless explicitly instructed.
- DO NOT refactor, reformat, or reorder logic.
- Preserve all existing syntax, exports, and structure.

### Allowed changes ONLY

- Add or modify:
  - JSDoc / TSDoc comments
  - Block comments
  - Inline explanatory comments
- Comments must be attached to existing code, not recreated code.

### Output format

AI must:

1. Identify which parts of the file will receive documentation.
2. Show ONLY the modified snippets (diff-style or isolated blocks).
3. Explicitly state: “No functional code was changed.”

### Uncertainty rule

If documentation would require guessing or changing behavior:

- Ask for clarification first, OR
- Add a TODO comment instead of changing code.

### Failure handling

If the AI cannot confidently apply documentation without risking breakage:

- It must refuse and explain why.

---

## Rule #2: API Route Authentication (SECURITY)

All serverless API routes in `/api` directory must implement JWT authentication.

### Required for all API routes

1. **Import shared auth utility**:

   ```typescript
   import { getBearerToken, verifySupabaseToken, getSupabaseEnv } from './utils/auth';
   ```

2. **Include Authorization in CORS headers**:

   ```typescript
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
   ```

3. **Validate environment variables early**:

   ```typescript
   const env = getSupabaseEnv();
   if ('error' in env) {
     return res.status(500).json({ error: env.error });
   }
   ```

4. **Verify JWT token before processing**:

   ```typescript
   const token = getBearerToken(req);
   if (!token) {
     return res.status(401).json({ error: 'Missing Authorization bearer token' });
   }

   const authResult = await verifySupabaseToken(token);
   if ('error' in authResult) {
     return res.status(401).json({ error: authResult.error });
   }
   ```

### Rationale

- Prevents unauthorized access to paid external APIs (OpenAI, Nominatim, etc.)
- Protects against billing abuse
- Ensures all requests are tied to authenticated users
- Enables per-user rate limiting and usage tracking

### Frontend implementation

All frontend services calling `/api` routes must:

1. Get current session token:

   ```typescript
   const {
     data: { session },
   } = await supabase.auth.getSession();
   const token = session?.access_token;
   ```

2. Include Authorization header:
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json',
   }
   ```

### Exceptions

- OPTIONS requests (CORS preflight) - return 200 without auth
- Public webhooks with signature verification - use alternative auth method

### Reference

See `docs/security/api-authentication.md` for complete implementation guide.
