# AI Summary Generation

This document describes how `/api/summarize-dive` builds AI dive summaries and why the route is structured the way it is.

## Purpose and Scope

- Generate concise, useful dive-log summaries from user-provided dive details.
- Keep outputs grounded in explicit dive data.
- Return a stable user-facing text format for the UI.
- Avoid site-specific hardcoded inference catalogs.

Out of scope:

- Rate limiting and quota management (planned separately).
- Persistent analytics of prompt/token usage.

## End-to-End Flow

1. Frontend collects dive values (including unsaved form edits when generating from the dive editor).
2. Frontend calls `/api/summarize-dive` with `{ dive: DiveSummaryPayload }`.
3. API authenticates request using bearer token and shared auth utility.
4. API normalizes dive payload into a consistent context shape.
5. API derives signal-based hints (conditions/risk profile) from explicit fields.
6. API asks the model for strict JSON output.
7. API parses model JSON and renders deterministic sectioned text.
8. API returns `{ summary: string }` to the frontend.

## Module Layout

Route-local modules live under `api/summarize-dive/`:

- `types.ts`: route payload/context/model response types.
- `constants.ts`: model settings, enum labels, fallback strings.
- `normalize.ts`: payload normalization and label mapping.
- `signals.ts`: generic signal extraction and inference hints.
- `prompt.ts`: prompt construction.
- `format.ts`: model JSON parsing and final text formatting.

`api/summarize-dive.ts` is intentionally thin and orchestration-only.

## Data Contract

## Request

- API accepts either `{ dive: ... }` or a direct dive object in request body.
- Payload supports both legacy and nested location fields:
  - `location`, `locationName`, and `locations.name`
  - `country`, `locationCountry`, and `locations.country`

Core optional fields used for context include:

- Profile: `date`, `depth`, `duration`, `dive_type`
- Conditions: `water_temp`, `visibility`, `water_type`, `exposure`, `currents`, `weight`
- Gas: `gas`, `nitrox_percent`, `start_pressure`, `end_pressure`, `air_usage`
- Content: `equipment`, `wildlife`, `notes`
- Optional cylinder metadata: `cylinder_type`, `cylinder_size`

## Response

- Route returns JSON with a single field:
  - `{ "summary": "<plain sectioned text>" }`

Important:

- The model output is requested as JSON internally.
- Users do not see raw model JSON.
- Users see rendered text sections:
  - `Summary`
  - `Similar locations`
  - `Tips`
  - `Future practice`

## Inference Policy

Inference is generic and signal-based only.

- Allowed: high-confidence inference from explicit user-provided fields/signals.
- Not allowed: hardcoded site dictionaries or hidden location databases.

Examples of signals:

- Cold water
- Strong/moderate current
- Cave overhead environment
- Low visibility
- Deep or long profile
- Nitrox usage

If confidence is low, output remains generic.

## Fallback and Error Behavior

Model response handling:

- If model returns valid JSON, section fields are read from keys.
- If keys are missing, per-section defaults are used.
- If output is not valid JSON, raw content is used as summary fallback and other sections use defaults.

HTTP behavior:

- `200`: summary generated.
- `400`: missing dive payload.
- `401`: missing/invalid auth token.
- `405`: non-POST method.
- `500`: env/config/model/runtime errors.

## Security and CORS

Authentication:

- Shared auth helpers in `api/utils/auth.ts`.
- Route validates env and verifies bearer token before model call.

CORS:

- Route sets:
  - `Access-Control-Allow-Origin`
  - `Access-Control-Allow-Methods`
  - `Access-Control-Allow-Headers` (includes `Authorization`)
- Handles `OPTIONS` preflight with `200`.

Rationale:

- Consistency with other protected API routes.
- Reliable browser behavior for authenticated API calls.

## Testing Matrix

Current tests cover:

- 401 behavior for missing bearer token.
- Nested location normalization.
- Deterministic section formatting.
- Missing-key defaults.
- Non-JSON fallback behavior.
- Draft-form generation path in frontend summary component.

## Extension Guidelines

- Keep route handler minimal; add logic in route-local modules.
- Prefer signal-driven inference over location-specific lists.
- Preserve external response contract (`{ summary: string }`).
- Update tests whenever prompt or fallback behavior changes.
