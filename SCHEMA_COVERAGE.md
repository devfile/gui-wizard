# Devfile 2.3.0 Schema Coverage

This document tracks what's implemented vs what's missing from the devfile 2.3.0 schema.

## ✅ Currently Implemented

### Metadata
- ✅ name (required)
- ✅ version
- ✅ displayName
- ✅ description
- ✅ language
- ✅ projectType
- ✅ provider
- ✅ tags
- ✅ website
- ✅ supportUrl

### Projects
- ✅ name (required)
- ✅ clonePath
- ✅ git.remotes
- ✅ git.checkoutFrom.revision
- ✅ git.checkoutFrom.remote
- ✅ zip.location
- ❌ attributes

### Components
- ✅ container (basic)
  - ✅ name (required)
  - ✅ image (required)
  - ✅ mountSources
  - ✅ memoryLimit
  - ✅ cpuLimit
  - ❌ env
  - ❌ volumeMounts
  - ❌ endpoints
  - ❌ sourceMapping
  - ❌ dedicatedPod
  - ❌ deployByDefault
  - ❌ args
  - ❌ commands
- ✅ volume (basic)
  - ✅ name (required)
  - ✅ size
  - ❌ ephemeral
- ❌ kubernetes component type
- ❌ openshift component type
- ❌ image component type

### Commands
- ✅ exec (basic)
  - ✅ id (required)
  - ✅ component (required)
  - ✅ commandLine (required)
  - ✅ workingDir
  - ❌ env
  - ❌ group
  - ❌ label
  - ❌ hotReloadCapable
- ❌ apply command type
- ❌ composite command type

### Events
- ✅ preStart
- ✅ postStart
- ✅ preStop
- ✅ postStop

### Variables
- ✅ Basic key-value pairs

### Other
- ❌ starterProjects (not implemented)
- ❌ parent (not implemented)
- ❌ top-level attributes (in state but no UI)

## 🔄 In Progress

See TODO list for current implementation status.
