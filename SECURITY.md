# Security Policy

This document describes security-related decisions and vulnerability assessments for this repository.

## Dependency Vulnerability Note – minimatch (client)

A Dependabot alert reports a ReDoS vulnerability in the `minimatch` package
found in `client/package-lock.json`.

### Analysis

- The vulnerability affects cases where **untrusted user input** is passed as glob patterns.
- In this repository, `minimatch` is used **only as a transitive dependency**
  via `eslint` and `eslint-plugin-react`.
- These tools run in **development and CI environments only**.
- All glob patterns are **static and trusted**.

### Conclusion

No exploitable denial-of-service risk has been identified in this repository.
The alert is monitored and will be resolved when upstream tooling updates its dependencies.
