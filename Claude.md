# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository contains a single-page React application for creating devfiles through a user-friendly GUI wizard. The application uses React and Tailwind CSS to provide a step-by-step interface for generating devfile 2.3.0 compliant YAML files.

**Key Resources:**
- Devfile specification: https://devfile.io/docs/
- Feature request: https://github.com/devfile/api/issues/1765
- Devfile 2.3.0 spec should be the target version

## Project Architecture

**Application Type:** Single-page application (SPA) with no backend or persistent state
**UI Framework:** React
**Styling:** Tailwind CSS
**Output:** Generated devfile.yaml files available for download

The application is stateless - all devfile generation happens client-side with no data persistence.

### Layers

- `src/utils/factories.js` - factories for every editable devfile element, and the conventions the
  wizard state follows: `null` means "this optional sub-object is not selected", `''` means
  "selected but empty", `undefined` for a boolean means "not set", maps are kept as ordered
  `[{ key, value }]` arrays, and free-form `attributes` are kept as raw YAML text.
- `src/utils/devfileGenerator.js` - `buildDevfile`/`generateYaml` serialize the state by walking the
  schema explicitly (never by cleaning up the UI state), and `validateDevfile` returns blocking
  `errors` and advisory `warnings`.
- `src/components/editors/` - editors for one component, command, project, endpoint list or git
  source. They take `value`/`onChange` and are reused by the steps and by the parent overrides,
  where `partial` relaxes the required fields and keeps booleans tri-state.
- `src/components/steps/` - one component per entry of `WIZARD_STEPS`, wired in
  `WizardContainer` by step id.

### Adding a schema field

1. Add it to the matching factory in `factories.js`.
2. Serialize it in `devfileGenerator.js` and validate it if the schema or the devfile/api rules
   constrain it.
3. Expose it in the editor or step that owns the section.
4. Add it to the fixtures in `tests/unit/fixtures/devfile-states.js` - the schema coverage test
   fails while a schema field is never generated.
5. Update `SCHEMA_COVERAGE.md`.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production (into `public/`, which is the folder deployed to GitHub Pages)
- `npm test` - Run the whole Playwright suite
- `npm run test:unit` - Serializer, validator and schema compliance tests (node, no browser)
- `npm run test:e2e` - Browser tests

There is no linter configured in this project.

## MCP Servers

This project uses the following MCP servers (configured in `.mcp.json`):

- **context7**: Provides up-to-date React and Tailwind CSS documentation
- **playwright**: For browser automation and testing

## Key Implementation Requirements

1. **Step-by-step wizard interface** - Guide users through devfile creation with clear, sequential steps
2. **Devfile 2.3.0 compliance** - Generated YAML must conform to the devfile 2.3.0 specification
3. **Download capability** - Users must be able to download the generated devfile.yaml
4. **Single page design** - All functionality contained in one web page with no routing
5. **No state persistence** - Application does not save or persist user data between sessions

## Devfile Concepts to Understand

When working with this codebase, familiarize yourself with these devfile concepts:
- Components (containers, volumes, kubernetes, openshift and image components)
- Commands (exec, apply, composite) and their groups
- Events (preStart, postStart, preStop, postStop)
- Projects, starterProjects and dependentProjects (git and zip sources)
- Parent inheritance and overrides
- Metadata, variables and free-form attributes

`SCHEMA_COVERAGE.md` maps every schema field to the place it is edited, and lists the validation
rules applied on top of the schema. The schema itself is vendored in
`tests/schema/devfile-2.3.0.json`.

Refer to https://devfile.io/docs/ for detailed schema and examples.
