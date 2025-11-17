Testing guide for server tests

Folder structure
- server/tests/unit/     - fast unit tests for small pure functions or DAO helpers. These should not start the server and must run quickly.
- server/tests/integration/ - tests that exercise Express routes using supertest. These should set DB_PATH=':memory:' so they run in isolation.

Naming conventions
- Use `*.test.ts` for Jest tests.
- Group files by feature (e.g. `community.post.test.ts`), or by layer (`validate.test.ts` under unit).

Examples
- `server/tests/unit/validate.test.ts` - tests validation helpers like `requireFields`.
- `server/tests/integration/community.post.test.ts` - tests POST /community validation and DB insertion using in-memory DB.

Run tests
From repository root:
# Server testing guide

Decision: tests are grouped by feature (feature-based grouping).

Why this choice:

- Features map to product behaviour (playdates, community, auth, comments). Grouping tests by feature keeps all tests that exercise the same behaviour close together: unit, integration, and (optionally) e2e helpers.
- It reduces cognitive load when working on a feature — developers can open a single `tests/<feature>/` folder to find everything needed to understand and verify that feature.
- This layout mirrors how the rest of the repo is organized (routes/services/dao per feature) and makes it easier to add targeted CI jobs that run tests only for changed features.

Recommended structure (feature-based):

- tests/
	- <feature>/
		- unit/
			- *.test.ts         # fast, isolated tests for pure helpers used by the feature
		- integration/
			- *.test.ts         # route-level tests that exercise Express handlers, DB (':memory:'), and services
		- e2e/                # optional: longer end-to-end tests or server-spawn helpers
			- helpers/          # helpers for launching a real server (NOT named *.test.*)

Examples:

- `tests/community/integration/community.post.test.ts` — supertest tests for POST /community
- `tests/playdates/unit/validate.test.ts` — validation helpers used by playdate routes

Guidelines:

- Keep test helpers (server spawn helpers, shared fixtures) in `tests/_helpers/` or `tests/<feature>/e2e/helpers/` and make sure they are not picked up by Jest as test files (avoid `*.test.*` suffix on helpers).
- Use `DB_PATH=':memory:'` for integration tests so they run fast and isolated.
- Unit tests should not touch the DB or filesystem.
- Integration tests may seed the DB via SQL schema files or helper functions; always reset the DB between tests.

Running tests:

From the `server` folder run:

```powershell
npm test
```

To run a single test file (serial):

```powershell
npx jest tests/community/integration/community.post.test.ts --runInBand
```

Migration / next steps:
