---
inclusion: manual
name: security
description: Security guidelines for auth, secrets, and API hardening
---

# Security Guidelines

Reference this file when working on authentication, authorization, API hardening, or anything that touches secrets or user data.

## Secrets Management

- Never commit `.env`, `*.pem`, `*.key`, or any file containing real credentials.
- Reference secrets exclusively via environment variables. Log the variable name on startup to confirm it is set, never its value.
- The `.gitignore` already excludes `.env`. Verify it stays that way before adding any new secret-bearing files.

## JWT

- Sign tokens with `jsonwebtoken` using `HS256` (default). Use a minimum 32-character random `JWT_SECRET`.
- Set a reasonable expiry (`expiresIn: '8h'` for operator sessions).
- Verify the token on every protected request. Reject with `401 Unauthorized` for missing, expired, or tampered tokens.
- Never include sensitive fields (passwords, internal IDs, PII) in the JWT payload.

## Password Storage

- Always hash passwords with `bcryptjs` before storing. Use a cost factor of at least 10.
- Never log, return, or store plaintext passwords anywhere.
- Compare passwords with `bcrypt.compare` — do not implement custom comparison logic.

## API Hardening

- Restrict `CORS_ORIGINS` to the exact frontend domain in production. Do not use `*` in production.
- Validate and sanitise all request body fields before using them in SQL queries or business logic.
- Use parameterised queries for all DB access — never concatenate user input into SQL.
- Return `400 Bad Request` for malformed input, `401` for auth failures, `403` for authorisation failures, `404` for not-found, and `500` only for truly unexpected server errors.
- Do not expose stack traces or internal error messages to clients in production (`NODE_ENV=production`).

## Data Privacy

- Photo data is currently base64-encoded in incident payloads. Before handling real citizen data, move images to object storage (e.g. AWS S3, Cloudflare R2) and store only the URL.
- Complaint lookup endpoints should be rate-limited before going to production to prevent enumeration attacks.
- Do not store or log IP addresses or user-agent strings unless explicitly required by the feature.

## Dependency Safety

- Pin dependency versions (exact or tilde ranges). Do not use `*` or open `>=` ranges.
- Review `npm audit` output before deploying. Resolve high/critical vulnerabilities before release.
