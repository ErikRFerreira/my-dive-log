# API Authentication

This document describes the JWT authentication implementation for Vercel serverless API routes.

## Overview

All API routes that access external services (Nominatim geocoding, Groq AI) are protected with JWT token authentication. This prevents unauthorized access and protects against billing abuse.

## Implementation Date

Implemented: February 7, 2026

## Protected Endpoints

### 1. `/api/geocode-location`

- **Purpose**: Geocodes location names to lat/lng coordinates using OpenStreetMap Nominatim
- **Method**: POST
- **Authentication**: Required (JWT Bearer token)
- **Rate Limit**: None (protected by auth)

### 3. `/api/delete-account`

- **Purpose**: Deletes user account and all associated data
- **Method**: POST
- **Authentication**: Required (JWT Bearer token + service role key)
- **Rate Limit**: None (protected by auth)

## Architecture

### Shared Authentication Utility

Location: `api/utils/auth.ts`

Provides reusable authentication functions:

- `getBearerToken(req)` - Extracts JWT token from Authorization header
- `getSupabaseEnv()` - Validates required environment variables
- `verifySupabaseToken(token)` - Verifies token with Supabase and returns user

### Authentication Flow

1. Client requests session token from Supabase: `supabase.auth.getSession()`
2. Client includes token in Authorization header: `Bearer ${token}`
3. API route extracts token using `getBearerToken()`
4. API route verifies token using `verifySupabaseToken()`
5. If valid, proceed with request; otherwise return 401

### Frontend Implementation

Both frontend services have been updated to include authentication:

- `src/services/apiGeocode.ts` - Geocoding service
- `src/services/apiAI.ts` - AI summary service

Both services:

1. Get current session token before making request
2. Include `Authorization: Bearer ${token}` header
3. Throw error if not authenticated

## Security Features

### Token Validation

- Uses Supabase's `auth.getUser(token)` for validation
- Automatically checks:
  - Token signature validity
  - Token expiration
  - Token issuer
  - User existence

### CORS Configuration

All endpoints include:

```typescript
res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
```

### Environment Variable Validation

- All endpoints validate required Supabase env vars exist
- Return 500 error early if configuration is missing
- Prevents silent failures in production

### Error Responses

**401 Unauthorized** - Token missing, invalid, or expired

```json
{ "error": "Missing Authorization bearer token" }
{ "error": "Not authenticated" }
```

**500 Internal Server Error** - Configuration issues

```json
{ "error": "Missing Supabase URL environment variable" }
```

## Migration from Unauthenticated

### Before

```typescript
const res = await fetch('/api/geocode-location', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Blue Lagoon' }),
});
```

### After

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();
const token = session?.access_token;

const res = await fetch('/api/geocode-location', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ name: 'Blue Lagoon' }),
});
```

## Testing

### Authenticated Request (should succeed)

```bash
curl -X POST https://your-app.vercel.app/api/geocode-location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <valid_jwt_token>" \
  -d '{"name":"Blue Lagoon","country_code":"PT"}'
```

### Unauthenticated Request (should fail with 401)

```bash
curl -X POST https://your-app.vercel.app/api/geocode-location \
  -H "Content-Type: application/json" \
  -d '{"name":"Blue Lagoon","country_code":"PT"}'
```

### Expired Token (should fail with 401)

```bash
curl -X POST https://your-app.vercel.app/api/geocode-location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <expired_jwt_token>" \
  -d '{"name":"Blue Lagoon","country_code":"PT"}'
```

## Required Environment Variables

### Production (Vercel)

- `VITE_SUPABASE_URL` or `SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY`
- `NOMINATIM_USER_AGENT` (for geocoding endpoint)
- `SUPABASE_SERVICE_ROLE_KEY` (for delete-account endpoint only)

### Development (.env.local)

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NOMINATIM_USER_AGENT=DiveLogApp/1.0 (contact@example.com)
GROQ_API_KEY=gsk_xxxxx
```

## Future Improvements

### Recommended

- [ ] Add rate limiting per user (Upstash Redis or Vercel KV)
- [ ] Add request logging/monitoring (Sentry, LogRocket)
- [ ] Add API usage metrics per user
- [ ] Consider API usage quotas or billing

### Optional

- [ ] Add API key alternative for mobile apps
- [ ] Add webhook signature verification for callbacks
- [ ] Add IP allowlisting for admin endpoints

## Maintenance

### Adding Authentication to New Endpoints

1. Import auth utility:

```typescript
import { getBearerToken, verifySupabaseToken, getSupabaseEnv } from './utils/auth';
```

2. Add CORS headers (include Authorization):

```typescript
res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
```

3. Validate environment:

```typescript
const env = getSupabaseEnv();
if ('error' in env) {
  return res.status(500).json({ error: env.error });
}
```

4. Verify token:

```typescript
const token = getBearerToken(req);
if (!token) {
  return res.status(401).json({ error: 'Missing Authorization bearer token' });
}

const authResult = await verifySupabaseToken(token);
if ('error' in authResult) {
  return res.status(401).json({ error: authResult.error });
}

const user = authResult.user;
// Proceed with authenticated request
```

### Refreshing Tokens

Supabase handles token refresh automatically in the client when:

- `autoRefreshToken: true` is set (default in `src/services/supabase.ts`)
- Token is within refresh window

Frontend services always get the latest token via `getSession()`, ensuring fresh tokens are used.

## Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
