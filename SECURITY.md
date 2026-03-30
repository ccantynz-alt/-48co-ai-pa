# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in 48co Voice, please report it responsibly.

**Email:** [support@48co.nz](mailto:support@48co.nz)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge your report within 48 hours and aim to resolve critical issues within 7 days.

## Supported Versions

| Component | Version | Supported |
|-----------|---------|-----------|
| Website (Next.js) | Latest on main | Yes |
| Desktop App (Tauri) | Latest release | Yes |
| Chrome Extension | Latest release | Yes |
| iOS Keyboard | Latest release | Yes |
| Android Keyboard | Latest release | Yes |

## Security Practices

- Passwords are hashed with bcrypt
- Session tokens are cryptographically random with 30-day expiry
- All data in transit is encrypted with TLS 1.3
- Offline mode processes everything on-device with zero cloud transmission
- API keys are never committed to the repository
- Dependencies are monitored via Dependabot for known vulnerabilities
