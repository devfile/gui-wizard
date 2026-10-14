# Devfile GUI Wizard - Tests

The suite runs on [Playwright](https://playwright.dev/) and has two projects:

| Project | Directory | What it covers |
|---|---|---|
| `unit` | `tests/unit` | The devfile serializer and validator, and compliance with the devfile 2.3.0 JSON schema. Runs in node, no browser needed. |
| `chromium` | `tests/e2e` | The wizard itself, driven through the browser. |

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers (first time only, for the e2e project):
   ```bash
   npx playwright install
   ```

### Run Tests

```bash
# Everything
npm test

# Serializer, validator and schema compliance only
npm run test:unit

# Browser tests only
npm run test:e2e

# Interactive UI mode
npm run test:ui

# A single file
npx playwright test tests/unit/devfile-validation.spec.js
```

## Test Files

### `tests/unit/schema-coverage.spec.js`

Checks the wizard against the published devfile 2.3.0 JSON schema, vendored in
`tests/schema/devfile-2.3.0.json` so the suite stays offline and pinned:

- every devfile the wizard can generate is accepted by the schema (validated with ajv),
- **every field of the schema can be generated** — the test walks the schema and fails when one of
  its fields never appears in the generated devfiles,
- the wizard never emits a field the schema does not define,
- a devfile rejected by the wizard's own validator is also rejected by the schema.

The maximal devfiles it uses live in `tests/unit/fixtures/devfile-states.js`. When the wizard gains
support for a new field, add it there.

### `tests/unit/devfile-generator.spec.js`

Serialization rules: blank values are dropped, strings trimmed, maps built from the wizard's
key/value lists, booleans that default to `false` only emitted when `true`, tri-state booleans kept
inside parent overrides, free-form `attributes` parsed from YAML, and the YAML output parsing back
into the same object.

### `tests/unit/devfile-validation.spec.js`

One test per validation rule: metadata, projects, components, commands, events, parent and parent
overrides, including which problems are errors and which are only warnings.

### `tests/e2e/quarkus-devfile.spec.js`

Rebuilds the [Quarkus API Example devfile](https://github.com/che-incubator/quarkus-api-example/blob/main/devfile.yaml)
through the UI — `generateName`, devfile attributes, container env, endpoints, volume mounts,
resource requests and limits, command labels and groups, and the `postStart` event — then compares
the generated YAML with the expected devfile. A second test downloads the file and parses it.

### `tests/e2e/full-coverage.spec.js`

Walks the sections the Quarkus example does not use: the parent step, the three project lists, all
five component types, all three command types and variables. It also covers the validation
feedback: errors are shown on their step and disable the download, warnings do not.

## Updating the schema

The vendored schema comes from the devfile project:

```bash
curl -o tests/schema/devfile-2.3.0.json https://devfile.io/devfile-schemas/2.3.0.json
```

## Debugging Tests

```bash
# Playwright inspector
npm run test:debug

# Watch the browser
npx playwright test --project=chromium --headed

# Open the last report
npx playwright show-report
```

## CI

`.github/workflows/test.yaml` builds the app and runs the whole suite on every push to `main` and
on every pull request, and uploads the Playwright report as an artifact.
