# Contributing

## Requirements

- Node.js 20 (recommended via `.nvmrc`)
- npm (use `npm ci`)

## Local development

- Install: `npm ci`
- Dev: `npm run dev`

## Quality gates (must pass)

- Lint: `npm run lint`
- Unit tests: `npm run test:unit`
- Build: `npm run build`
- E2E: `npm run test:e2e`

## Project rules

- Keep changes minimal and scoped to the requested task.
- Do not add or remove comments/documentation unless explicitly requested.
- Prefer stable selectors (`data-testid`) for UI elements that are used in Playwright tests.
- If you change UI behavior that impacts tests, update the corresponding E2E specs.
