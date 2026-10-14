# Devfile 2.3.0 Schema Coverage

The wizard covers the **whole** [devfile 2.3.0 schema](https://devfile.io/docs/2.3.0/devfile-schema):
every field below can be produced through the UI, and nothing outside the schema is ever written
to the generated `devfile.yaml`.

Both claims are enforced by tests. `tests/unit/schema-coverage.spec.js` walks the published schema
(vendored in `tests/schema/devfile-2.3.0.json`) and fails if the wizard cannot generate one of its
fields, or if it generates a field the schema does not define.

## Top level

| Field | Where in the wizard |
|---|---|
| `schemaVersion` | fixed to 2.3.0 |
| `metadata` | Basics |
| `attributes` | Basics → Devfile attributes |
| `parent` | Parent |
| `projects`, `starterProjects`, `dependentProjects` | Projects |
| `components` | Components |
| `commands` | Commands |
| `events` | Events |
| `variables` | Variables |

## metadata

`name`, `version`, `displayName`, `description`, `icon`, `language`, `projectType`, `provider`,
`tags`, `architectures`, `website`, `supportUrl`, `globalMemoryLimit`, `attributes`.

`generateName` is also offered. It is not part of the schema, but `metadata` accepts additional
properties and Eclipse Che stacks use it to get a unique workspace name per start. It is mutually
exclusive with `name`.

## parent

Source: `uri`, `id` (with `registryUrl` and `version`) or `kubernetes` (`name`, `namespace`).

Overrides: `components`, `commands`, `projects`, `starterProjects`, `dependentProjects`,
`variables` and `attributes`.

Overrides are merged on top of the parent, so no field inside them is mandatory and booleans keep a
distinct "not set" state. Two schema rules only apply to overrides and are checked by the wizard:

- an `image` override sets either `dockerfile` or `autoBuild`, never both,
- a reference to a component or a command that the parent provides is a warning, not an error.

## projects, starterProjects, dependentProjects

`name`, `attributes`, and either a `git` source (`remotes`, `checkoutFrom.remote`,
`checkoutFrom.revision`) or a `zip` source (`location`).

`projects` and `dependentProjects` additionally have `clonePath`; `starterProjects` have
`description` and `subDir`, and accept a single remote.

## components

Every component has `name` and `attributes` plus exactly one type:

- **container**: `image`, `command`, `args`, `env`, `volumeMounts`, `endpoints`, `memoryRequest`,
  `memoryLimit`, `cpuRequest`, `cpuLimit`, `mountSources`, `sourceMapping`, `dedicatedPod`,
  `annotation.deployment`, `annotation.service`
- **volume**: `size`, `ephemeral`
- **kubernetes** / **openshift**: `uri` or `inlined`, `deployByDefault`, `endpoints`
- **image**: `imageName`, `autoBuild`, and a `dockerfile` built from a `uri`, a `devfileRegistry`
  (`id`, `registryUrl`) or a `git` source (`remotes`, `checkoutFrom`, `fileLocation`), with
  `buildContext`, `rootRequired` and `args`

Endpoints carry `name`, `targetPort`, `exposure`, `protocol`, `path`, `secure`, `annotation` and
`attributes`.

## commands

Every command has `id` and `attributes` plus exactly one type:

- **exec**: `commandLine`, `component`, `workingDir`, `env`, `hotReloadCapable`, `label`, `group`
- **apply**: `component`, `label`, `group`
- **composite**: `commands`, `parallel`, `label`, `group`

`group` is a `kind` (`build`, `run`, `test`, `debug`, `deploy`) and an `isDefault` flag.

## events

`preStart`, `postStart`, `preStop` and `postStop`, each an ordered list of command ids.

## Validation

On top of the schema, the wizard applies the
[devfile/api validation rules](https://github.com/devfile/api/blob/main/pkg/validation/validation-rule.md):

- names and ids are unique, lowercase alphanumeric with dashes, and at most 63 characters
  (15 for endpoint names)
- endpoint names are unique across all components and two containers cannot expose the same
  `targetPort` unless one of them runs in a dedicated pod
- `memoryRequest`/`cpuRequest` cannot exceed `memoryLimit`/`cpuLimit`, and all quantities must parse
  as Kubernetes resource quantities
- `PROJECT_SOURCE` and `PROJECTS_ROOT` cannot be redefined in an `env` list
- volume mounts reference a volume component, exec commands reference a container component, and
  composite commands cannot reference themselves directly or indirectly
- a command group has at most one default command
- `preStart` and `postStop` events only accept apply commands, `postStart` and `preStop` only exec
  commands (or composites made of them)
- a git source needs at least one remote, and a `checkoutFrom.remote` as soon as it has several

Errors block the download, warnings do not.
