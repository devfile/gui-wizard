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

## Development Commands

This section will be populated once the project structure is initialized. Expected commands include:
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run test` - Run tests (if applicable)

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
- Components (containers, volumes, kubernetes resources)
- Commands (exec, apply, composite)
- Events (preStart, postStart, preStop, postStop)
- Projects (git repositories)
- StarterProjects (templates)
- Metadata (name, version, description, attributes)

Refer to https://devfile.io/docs/ for detailed schema and examples.
