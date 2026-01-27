# Devfile GUI Wizard - Tests

This directory contains end-to-end tests for the Devfile GUI Wizard using Playwright.

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers (first time only):
   ```bash
   npx playwright install
   ```

### Run Tests

```bash
# Run all tests in headless mode
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run specific test file
npx playwright test quarkus-devfile.spec.js

# Run tests in headed mode (see the browser)
npx playwright test --headed
```

## Test Files

### `quarkus-devfile.spec.js`

Tests the generation of a Quarkus-like devfile through the wizard interface.

**Test 1: Quarkus-like devfile generation**
- Creates a simplified version of the [Quarkus API Example devfile](https://github.com/che-incubator/quarkus-api-example/blob/main/devfile.yaml)
- Verifies:
  - Schema version is 2.3.0
  - Metadata is correctly set
  - Components (tools container, postgresql container, m2 volume)
  - Commands (package, startdev)
  - Events (postStart: package)
  - Schema compliance (no `type` field in components, no `kind` field in commands)

**Test 2: Schema compliance**
- Verifies that minimal devfiles comply with Devfile 2.3.0 specification
- Ensures no deprecated fields are present in the generated YAML

## Current Limitations

The test generates a simplified version of the Quarkus devfile because the following features are not yet implemented in the UI:

### Not Yet Supported:
- `generateName` (uses `name` instead)
- Component features:
  - Environment variables (`env`)
  - Endpoints
  - Volume mounts (`volumeMounts`)
  - Resource requests (`memoryRequest`, `cpuRequest`)
- Command features:
  - Labels
  - Groups (`group.kind`, `group.isDefault`)
- Root-level attributes

These features will be added in future enhancements to match the full Quarkus devfile specification.

## Test Output

When tests run successfully, you'll see:
- ✅ Test passed indicators
- Generated YAML output in the console
- Detailed test reports in `playwright-report/` directory

## Debugging Tests

To debug a failing test:

1. Run in debug mode:
   ```bash
   npm run test:debug
   ```

2. Or use the Playwright Inspector:
   ```bash
   npx playwright test --debug
   ```

3. View the test report:
   ```bash
   npx playwright show-report
   ```

## CI/CD

Tests are configured to run in CI environments. The configuration in `playwright.config.js` automatically detects CI environments and adjusts behavior accordingly (e.g., retries, parallel execution).
