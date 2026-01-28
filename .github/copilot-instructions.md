# Copilot Instructions (BravvoOS)

- Keep changes minimal and scoped to the request.
- Do not add or remove comments/documentation unless explicitly requested.
- Prefer stable selectors (`data-testid`) for UI elements used in Playwright tests.
- If UI/behavior changes impact E2E, update the relevant specs.
- Run quality gates before proposing a PR:
  - `npm run lint`
  - `npm run test:unit`
  - `npm run build`
  - `npm run test:e2e`
