# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in BrtNeura Kit, please report it responsibly.

**Email:** security@brtneura.info

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge your report within 48 hours and aim to resolve critical issues within 7 days.

**Do NOT open a public GitHub issue for security vulnerabilities.**

## Scope

This policy covers:

- The BrtNeura Kit web application at kit.brtneura.com
- The source code in this repository
- Firebase/Firestore configuration as used by this project

## Security Model

### Client-Side Processing

All tool data processing happens in the browser. User input (phone numbers, JSON, CSV, regex patterns) is never sent to any server. This is by design — the tools work offline after the initial page load.

### What We Collect

Anonymous usage analytics only:

- Tool usage counts (which tools are used, how often)
- Device type and browser (parsed from User-Agent, truncated to 120 chars)
- Timestamps (hourly and daily aggregation)

We do **NOT** collect:

- User input data
- IP addresses
- Personally identifiable information (PII)
- Cookies or session tokens

### Firebase / Firestore

- Firebase client SDK keys are public by design (they are scoped by Firebase security rules)
- Firestore rules enforce analytics-only writes with field-level validation
- Delete operations are denied at the rules level
- No authentication or user accounts exist

### Admin Authentication

- Admin dashboard uses server-side PIN verification via API route
- PIN is stored in a non-`NEXT_PUBLIC_` env var (never sent to the client bundle)
- Session is maintained via HTTP-only, Secure, SameSite=Strict cookie
- Session expires after 1 hour

### Security Headers

The application sets the following HTTP security headers:

- `Strict-Transport-Security` (HSTS with preload)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, geolocation denied)
- `Content-Security-Policy` (restricts script/style/connect sources)

**CSP note:** The CSP includes `unsafe-inline` and `unsafe-eval` in `script-src`. This is required by the Firebase client SDK for analytics initialization. We mitigate this by ensuring no user input is rendered as HTML (all output is text content via React's built-in escaping). No `dangerouslySetInnerHTML` is used anywhere in the codebase.

### Input Validation

- All text inputs have `maxLength` limits to prevent memory exhaustion
- Regex pattern input is capped at 500 characters
- Regex execution includes both iteration limits (1000 matches) and a 200ms time limit to prevent ReDoS
- Regex matching is debounced (150ms) to avoid excessive computation on rapid input
- Tool components are wrapped in ErrorBoundary for crash isolation

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest on `main` | Yes |
| Older commits | No |

## Acknowledgments

We appreciate responsible disclosure and will credit researchers (with permission) in release notes.
