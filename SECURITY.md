# Security Policy

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email **nithinp150@gmail.com** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- Any suggested mitigations (optional)

You can expect an acknowledgement within 48 hours and a resolution timeline within 7 days for critical issues.

## Scope

The following are in scope:

- Authentication or authorization bypasses
- Injection vulnerabilities (prompt injection, SQL injection, command injection)
- Exposure of the `ANTHROPIC_API_KEY` or other secrets through API responses or logs
- Insecure direct object references on session endpoints

## Out of Scope

- Denial-of-service attacks
- Issues in third-party dependencies (report those upstream)
- Theoretical vulnerabilities without a working proof-of-concept
