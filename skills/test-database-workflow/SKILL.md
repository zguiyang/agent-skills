---
name: test-database-workflow
description: >-
  Use for integration or functional tests that may migrate, seed, write, or
  clean a database. Do not use for pure unit tests or read-only investigation.
---

# Test database workflow

Use the repository's isolated test-database configuration before any database
write. This Skill does not authorize writes to development, staging, or
production data.

## Establish the target

1. Read the test configuration, environment template, and test command for the
   task.
2. Confirm the connection is the explicitly designated test target and that it
   is distinct from development and production.
3. If the target, isolation, or command is unclear, stop and ask. Never infer a
   fallback connection string or substitute a default database variable.

## Keep test data bounded

- Use the project test runner, migration, fixture, and cleanup mechanisms.
- Give created external records a test-specific identity where that aids safe
  cleanup.
- Track created records and clean up only data created by the test. Never use
  truncate, unscoped deletes, or broad time/pattern matching as routine cleanup.
- Prefer mocks for pure unit tests; use a real test database only when the
  behavior under test requires it.

Follow stricter repository-specific data, migration, and authorization rules
when they exist.
