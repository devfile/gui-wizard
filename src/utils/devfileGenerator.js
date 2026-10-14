import yaml from 'js-yaml'
import {
  K8S_NAME_PATTERN,
  METADATA_VERSION_PATTERN,
  PARENT_VERSION_PATTERN,
  RESERVED_ENV_NAMES,
  SCHEMA_VERSION_PATTERN
} from './constants'
import { getCommandType, getComponentType } from './factories'

/* ------------------------------------------------------------------ *
 * Primitive helpers
 * ------------------------------------------------------------------ */

function str(value) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

function int(value) {
  if (value === '' || value === null || value === undefined) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : undefined
}

/** Boolean that defaults to `false` in the schema: only emitted when `true`. */
function flag(value) {
  return value === true ? true : undefined
}

/** Tri-state boolean: `undefined` stays unset, `true`/`false` are emitted. */
function tri(value) {
  return value === true || value === false ? value : undefined
}

function strList(values) {
  if (!Array.isArray(values)) return undefined
  const cleaned = values.map(str).filter((value) => value !== undefined)
  return cleaned.length > 0 ? cleaned : undefined
}

/** `[{ key, value }]` -> `{ key: value }`, dropping entries without a key. */
function strMap(entries) {
  if (!Array.isArray(entries)) return undefined
  const result = {}
  for (const entry of entries) {
    const key = str(entry?.key)
    if (key === undefined) continue
    result[key] = typeof entry.value === 'string' ? entry.value.trim() : ''
  }
  return Object.keys(result).length > 0 ? result : undefined
}

/** Drops `undefined` members; always returns an object. */
function prune(object) {
  const result = {}
  for (const [key, value] of Object.entries(object)) {
    if (value !== undefined) result[key] = value
  }
  return result
}

/** Like `prune`, but collapses an empty result to `undefined`. */
function pruneOrOmit(object) {
  const pruned = prune(object)
  return Object.keys(pruned).length > 0 ? pruned : undefined
}

function mapList(items, build) {
  if (!Array.isArray(items) || items.length === 0) return undefined
  const built = items.map(build).filter((item) => item !== undefined)
  return built.length > 0 ? built : undefined
}

/**
 * Parses the raw YAML text used for free-form `attributes` maps.
 * Returns `{ value, error }` so that callers can report the problem without
 * throwing while the user is still typing.
 */
export function parseAttributes(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    return { value: undefined, error: null }
  }

  let parsed
  try {
    parsed = yaml.load(text)
  } catch (err) {
    return { value: undefined, error: err.message }
  }

  if (parsed === null || parsed === undefined) {
    return { value: undefined, error: null }
  }

  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { value: undefined, error: 'Attributes must be a YAML map of key/value pairs' }
  }

  return { value: parsed, error: null }
}

function attributes(text) {
  return parseAttributes(text).value
}

/* ------------------------------------------------------------------ *
 * Element serializers
 * ------------------------------------------------------------------ */

function buildEnv(entries) {
  return mapList(entries, (entry) => {
    const name = str(entry?.name)
    if (name === undefined) return undefined
    return { name, value: typeof entry.value === 'string' ? entry.value : '' }
  })
}

function buildVolumeMounts(entries) {
  return mapList(entries, (entry) => {
    const name = str(entry?.name)
    if (name === undefined) return undefined
    return prune({ name, path: str(entry.path) })
  })
}

function buildEndpoints(entries) {
  return mapList(entries, (endpoint) =>
    pruneOrOmit({
      name: str(endpoint?.name),
      targetPort: int(endpoint?.targetPort),
      exposure: str(endpoint?.exposure),
      protocol: str(endpoint?.protocol),
      secure: flag(endpoint?.secure),
      path: str(endpoint?.path),
      annotation: strMap(endpoint?.annotation),
      attributes: attributes(endpoint?.attributes)
    })
  )
}

function buildContainer(container, partial) {
  const bool = partial ? tri : flag

  return prune({
    image: str(container.image),
    command: strList(container.command),
    args: strList(container.args),
    env: buildEnv(container.env),
    volumeMounts: buildVolumeMounts(container.volumeMounts),
    endpoints: buildEndpoints(container.endpoints),
    memoryRequest: str(container.memoryRequest),
    memoryLimit: str(container.memoryLimit),
    cpuRequest: str(container.cpuRequest),
    cpuLimit: str(container.cpuLimit),
    mountSources: tri(container.mountSources),
    sourceMapping: str(container.sourceMapping),
    dedicatedPod: bool(container.dedicatedPod),
    annotation: pruneOrOmit({
      deployment: strMap(container.annotation?.deployment),
      service: strMap(container.annotation?.service)
    })
  })
}

function buildVolume(volume, partial) {
  const bool = partial ? tri : flag

  return prune({
    size: str(volume.size),
    ephemeral: bool(volume.ephemeral)
  })
}

function buildK8sLike(k8s) {
  return prune({
    uri: k8s.uri == null ? undefined : str(k8s.uri),
    inlined: k8s.inlined == null ? undefined : str(k8s.inlined),
    deployByDefault: tri(k8s.deployByDefault),
    endpoints: buildEndpoints(k8s.endpoints)
  })
}

function buildGitSource(git, { fileLocation = false } = {}) {
  return prune({
    remotes: strMap(git.remotes),
    checkoutFrom: pruneOrOmit({
      remote: str(git.checkoutFrom?.remote),
      revision: str(git.checkoutFrom?.revision)
    }),
    fileLocation: fileLocation ? str(git.fileLocation) : undefined
  })
}

function buildDockerfile(dockerfile, partial) {
  const bool = partial ? tri : flag

  return prune({
    uri: dockerfile.uri == null ? undefined : str(dockerfile.uri),
    devfileRegistry:
      dockerfile.devfileRegistry == null
        ? undefined
        : prune({
            id: str(dockerfile.devfileRegistry.id),
            registryUrl: str(dockerfile.devfileRegistry.registryUrl)
          }),
    git: dockerfile.git == null ? undefined : buildGitSource(dockerfile.git, { fileLocation: true }),
    buildContext: str(dockerfile.buildContext),
    rootRequired: bool(dockerfile.rootRequired),
    args: strList(dockerfile.args)
  })
}

function buildImage(image, partial) {
  const built = prune({
    imageName: str(image.imageName),
    autoBuild: tri(image.autoBuild)
  })

  // `dockerfile` is the only image source in 2.3.0; parent overrides may set
  // `autoBuild` alone, so an empty dockerfile is dropped there.
  const dockerfile = image.dockerfile ? buildDockerfile(image.dockerfile, partial) : undefined
  if (dockerfile && (!partial || Object.keys(dockerfile).length > 0)) {
    built.dockerfile = dockerfile
  }

  return built
}

export function buildComponent(component, partial = false) {
  const type = getComponentType(component)
  const built = prune({
    name: str(component.name),
    attributes: attributes(component.attributes)
  })

  switch (type) {
    case 'volume':
      built.volume = buildVolume(component.volume, partial)
      break
    case 'kubernetes':
      built.kubernetes = buildK8sLike(component.kubernetes)
      break
    case 'openshift':
      built.openshift = buildK8sLike(component.openshift)
      break
    case 'image':
      built.image = buildImage(component.image, partial)
      break
    case 'container':
    default:
      built.container = buildContainer(component.container, partial)
      break
  }

  return built
}

function buildCommandGroup(group, partial) {
  const bool = partial ? tri : flag
  const kind = str(group?.kind)
  if (kind === undefined) return undefined

  return prune({ kind, isDefault: bool(group.isDefault) })
}

export function buildCommand(command, partial = false) {
  const type = getCommandType(command)
  const bool = partial ? tri : flag
  const built = prune({
    id: str(command.id),
    attributes: attributes(command.attributes)
  })

  switch (type) {
    case 'apply':
      built.apply = prune({
        component: str(command.apply.component),
        label: str(command.apply.label),
        group: buildCommandGroup(command.apply.group, partial)
      })
      break
    case 'composite':
      built.composite = prune({
        commands: strList(command.composite.commands),
        parallel: bool(command.composite.parallel),
        label: str(command.composite.label),
        group: buildCommandGroup(command.composite.group, partial)
      })
      break
    case 'exec':
    default:
      built.exec = prune({
        commandLine: str(command.exec.commandLine),
        component: str(command.exec.component),
        workingDir: str(command.exec.workingDir),
        env: buildEnv(command.exec.env),
        hotReloadCapable: bool(command.exec.hotReloadCapable),
        label: str(command.exec.label),
        group: buildCommandGroup(command.exec.group, partial)
      })
      break
  }

  return built
}

export function buildProject(project, kind = 'projects') {
  const built = prune({
    name: str(project.name),
    attributes: attributes(project.attributes),
    clonePath: kind === 'starterProjects' ? undefined : str(project.clonePath),
    description: kind === 'starterProjects' ? str(project.description) : undefined,
    subDir: kind === 'starterProjects' ? str(project.subDir) : undefined
  })

  if (project.zip != null) {
    built.zip = prune({ location: str(project.zip.location) })
  } else {
    built.git = buildGitSource(project.git || {})
  }

  return built
}

function buildProjectList(projects, kind) {
  return mapList(projects, (project) => buildProject(project, kind))
}

function buildMetadata(metadata) {
  return pruneOrOmit({
    name: str(metadata.name),
    generateName: str(metadata.generateName),
    version: str(metadata.version),
    displayName: str(metadata.displayName),
    description: str(metadata.description),
    icon: str(metadata.icon),
    language: str(metadata.language),
    projectType: str(metadata.projectType),
    provider: str(metadata.provider),
    tags: strList(metadata.tags),
    architectures: strList(metadata.architectures),
    website: str(metadata.website),
    supportUrl: str(metadata.supportUrl),
    globalMemoryLimit: str(metadata.globalMemoryLimit),
    attributes: attributes(metadata.attributes)
  })
}

function buildParent(parent) {
  if (!parent) return undefined

  return pruneOrOmit({
    uri: parent.uri == null ? undefined : str(parent.uri),
    id: parent.id == null ? undefined : str(parent.id),
    kubernetes:
      parent.kubernetes == null
        ? undefined
        : prune({
            name: str(parent.kubernetes.name),
            namespace: str(parent.kubernetes.namespace)
          }),
    registryUrl: parent.id == null ? undefined : str(parent.registryUrl),
    version: parent.id == null ? undefined : str(parent.version),
    attributes: attributes(parent.attributes),
    variables: strMap(parent.variables),
    projects: buildProjectList(parent.projects, 'projects'),
    starterProjects: buildProjectList(parent.starterProjects, 'starterProjects'),
    dependentProjects: buildProjectList(parent.dependentProjects, 'dependentProjects'),
    components: mapList(parent.components, (component) => buildComponent(component, true)),
    commands: mapList(parent.commands, (command) => buildCommand(command, true))
  })
}

function buildEvents(events) {
  if (!events) return undefined

  return pruneOrOmit({
    preStart: strList(events.preStart),
    postStart: strList(events.postStart),
    preStop: strList(events.preStop),
    postStop: strList(events.postStop)
  })
}

/**
 * Turns the wizard state into a plain devfile 2.3.0 object.
 *
 * Only schema fields are ever emitted: the serializer walks the schema
 * explicitly instead of cleaning up the UI state, so wizard-only bookkeeping
 * can never leak into the generated YAML.
 */
export function buildDevfile(data) {
  return prune({
    schemaVersion: str(data.schemaVersion),
    metadata: buildMetadata(data.metadata || {}),
    attributes: attributes(data.attributes),
    parent: buildParent(data.parent),
    projects: buildProjectList(data.projects, 'projects'),
    starterProjects: buildProjectList(data.starterProjects, 'starterProjects'),
    dependentProjects: buildProjectList(data.dependentProjects, 'dependentProjects'),
    components: mapList(data.components, (component) => buildComponent(component, false)),
    commands: mapList(data.commands, (command) => buildCommand(command, false)),
    events: buildEvents(data.events),
    variables: strMap(data.variables)
  })
}

export function generateYaml(data) {
  return yaml.dump(buildDevfile(data), {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  })
}

/* ------------------------------------------------------------------ *
 * Validation
 *
 * Mirrors the rules enforced by devfile/api
 * (pkg/validation/validation-rule.md) on top of the JSON schema constraints.
 * ------------------------------------------------------------------ */

const QUANTITY_PATTERN =
  /^([+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+))(?:([eE][+-]?[0-9]+)|(Ki|Mi|Gi|Ti|Pi|Ei)|(n|u|m|k|M|G|T|P|E))?$/

const QUANTITY_SUFFIXES = {
  n: 1e-9,
  u: 1e-6,
  m: 1e-3,
  k: 1e3,
  M: 1e6,
  G: 1e9,
  T: 1e12,
  P: 1e15,
  E: 1e18,
  Ki: 2 ** 10,
  Mi: 2 ** 20,
  Gi: 2 ** 30,
  Ti: 2 ** 40,
  Pi: 2 ** 50,
  Ei: 2 ** 60
}

/** Parses a Kubernetes resource quantity, returning `null` when invalid. */
export function parseQuantity(value) {
  if (typeof value !== 'string') return null

  const match = QUANTITY_PATTERN.exec(value.trim())
  if (!match) return null

  const [, mantissa, exponent, binarySuffix, decimalSuffix] = match
  const base = Number(mantissa)
  if (!Number.isFinite(base)) return null

  if (exponent) return base * 10 ** Number(exponent.slice(1))

  const suffix = binarySuffix || decimalSuffix
  return suffix ? base * QUANTITY_SUFFIXES[suffix] : base
}

function isValidUri(value) {
  if (typeof value !== 'string' || value.trim() === '') return false
  const uri = value.trim()

  if (/\s/.test(uri)) return false

  if (uri.startsWith('http')) {
    try {
      const parsed = new URL(uri)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  return true
}

function isValidName(value) {
  return typeof value === 'string' && K8S_NAME_PATTERN.test(value) && value.length <= 63
}

function checkDuplicates(values, prefix, field, errors) {
  const seen = new Set()
  const reported = new Set()
  for (const value of values) {
    if (value === undefined) continue
    if (seen.has(value) && !reported.has(value)) {
      errors.push(`${prefix}: duplicate ${field} "${value}"`)
      reported.add(value)
    }
    seen.add(value)
  }
}

function validateAttributeText(text, path, errors) {
  const { error } = parseAttributes(text)
  if (error) errors.push(`${path}: invalid attributes YAML — ${error}`)
}

function validateGitRemotes(git, { label, singleRemote, partial }, errors) {
  const remotes = git?.remotes ? Object.keys(git.remotes) : []
  const checkoutRemote = git?.checkoutFrom?.remote

  if (remotes.length === 0) {
    // Overrides may rely on the remotes declared by the parent.
    if (!partial) errors.push(`${label}: a git source needs at least one remote`)
    return
  }

  if (singleRemote && remotes.length > 1) {
    errors.push(`${label}: a git source can only have one remote`)
    return
  }

  if (!singleRemote && remotes.length > 1 && !checkoutRemote) {
    errors.push(`${label}: checkoutFrom.remote is required when more than one remote is configured`)
    return
  }

  if (checkoutRemote && !remotes.includes(checkoutRemote)) {
    errors.push(`${label}: checkoutFrom.remote "${checkoutRemote}" is not one of the configured remotes`)
  }
}

function validateProjects(projects, { kind, label, partial }, errors, warnings) {
  if (!projects) return

  checkDuplicates(projects.map((project) => project.name), `${label}s`, 'name', errors)

  projects.forEach((project, index) => {
    const name = project.name
    const where = `${label} ${name ? `"${name}"` : `#${index + 1}`}`

    if (!name) {
      errors.push(`${where}: name is required`)
    } else if (!isValidName(name)) {
      errors.push(`${where}: name must be lowercase alphanumeric with dashes, max 63 characters`)
    }

    const sources = ['git', 'zip'].filter((key) => project[key] !== undefined)
    if (sources.length !== 1) {
      errors.push(`${where}: exactly one source (git or zip) must be configured`)
      return
    }

    if (project.git) {
      validateGitRemotes(project.git, { label: where, singleRemote: kind === 'starterProjects', partial }, errors)
    }

    if (project.zip && !project.zip.location) {
      warnings.push(`${where}: zip source has no location`)
    }
  })
}

function validateEndpointList(endpoints, where, errors, state, { isContainer, dedicatedPod, partial }) {
  if (!endpoints) return

  const portsInComponent = new Set()

  endpoints.forEach((endpoint, index) => {
    const label = `${where} endpoint ${endpoint.name ? `"${endpoint.name}"` : `#${index + 1}`}`

    if (!endpoint.name) {
      errors.push(`${label}: name is required`)
    } else {
      if (!K8S_NAME_PATTERN.test(endpoint.name) || endpoint.name.length > 15) {
        errors.push(`${label}: name must be lowercase alphanumeric with dashes, max 15 characters`)
      }
      if (state.endpointNames.has(endpoint.name)) {
        errors.push(`${label}: endpoint names must be unique across all components`)
      }
      state.endpointNames.add(endpoint.name)
    }

    if (endpoint.targetPort === undefined) {
      // An override can change any other field of an inherited endpoint.
      if (!partial) errors.push(`${label}: targetPort is required and must be an integer`)
    } else if (endpoint.targetPort < 1 || endpoint.targetPort > 65535) {
      errors.push(`${label}: targetPort must be between 1 and 65535`)
    } else if (isContainer && !dedicatedPod && !partial) {
      portsInComponent.add(endpoint.targetPort)
    }
  })

  for (const port of portsInComponent) {
    if (state.containerPorts.has(port)) {
      errors.push(`${where}: targetPort ${port} is already used by another container component`)
    }
    state.containerPorts.add(port)
  }
}

function validateComponents(components, errors, warnings, { hasParent, partial, label = 'Component' } = {}) {
  if (!components) return

  // References can also be satisfied by an element inherited from the parent,
  // which this wizard never resolves, so they only warn when a parent is set.
  const reference = hasParent || partial ? warnings : errors

  checkDuplicates(components.map((component) => component.name), `${label}s`, 'name', errors)

  const volumeNames = new Set(
    components.filter((component) => component.volume !== undefined).map((component) => component.name)
  )

  const endpointState = { endpointNames: new Set(), containerPorts: new Set() }

  // Containers of the shared workspace pod annotate the same deployment and
  // service, so the same key cannot be given two different values.
  const annotationState = { deployment: new Map(), service: new Map(), reported: new Set() }

  components.forEach((component, index) => {
    const name = component.name
    const where = `${label} ${name ? `"${name}"` : `#${index + 1}`}`

    if (!name) {
      errors.push(`${where}: name is required`)
    } else if (!isValidName(name)) {
      errors.push(`${where}: name must be lowercase alphanumeric with dashes, max 63 characters`)
    }

    const types = ['container', 'kubernetes', 'openshift', 'volume', 'image'].filter(
      (key) => component[key] !== undefined
    )
    if (types.length !== 1) {
      errors.push(`${where}: exactly one component type must be configured`)
      return
    }

    if (component.container) {
      const container = component.container

      if (!container.image && !partial) {
        errors.push(`${where}: container image is required`)
      }

      for (const env of container.env || []) {
        if (RESERVED_ENV_NAMES.includes(env.name)) {
          errors.push(`${where}: "${env.name}" is a reserved environment variable and cannot be redefined`)
        }
      }

      const quantities = {
        memoryLimit: container.memoryLimit,
        memoryRequest: container.memoryRequest,
        cpuLimit: container.cpuLimit,
        cpuRequest: container.cpuRequest
      }
      const parsed = {}
      for (const [field, value] of Object.entries(quantities)) {
        if (value === undefined) continue
        const quantity = parseQuantity(value)
        if (quantity === null) {
          errors.push(`${where}: ${field} "${value}" is not a valid quantity (for example 1Gi, 512Mi, 500m)`)
        } else {
          parsed[field] = quantity
        }
      }
      if (parsed.memoryRequest !== undefined && parsed.memoryLimit !== undefined && parsed.memoryRequest > parsed.memoryLimit) {
        errors.push(`${where}: memoryRequest is greater than memoryLimit`)
      }
      if (parsed.cpuRequest !== undefined && parsed.cpuLimit !== undefined && parsed.cpuRequest > parsed.cpuLimit) {
        errors.push(`${where}: cpuRequest is greater than cpuLimit`)
      }

      for (const mount of container.volumeMounts || []) {
        if (!mount.name) {
          errors.push(`${where}: a volume mount is missing its volume name`)
        } else if (!volumeNames.has(mount.name)) {
          reference.push(`${where}: volume mount "${mount.name}" does not reference a volume component`)
        }
      }

      if (container.dedicatedPod !== true) {
        for (const kind of ['deployment', 'service']) {
          for (const [key, value] of Object.entries(container.annotation?.[kind] || {})) {
            const seen = annotationState[kind]
            if (seen.has(key) && seen.get(key) !== value && !annotationState.reported.has(`${kind}/${key}`)) {
              errors.push(`${label}s: containers give conflicting values to the ${kind} annotation "${key}"`)
              annotationState.reported.add(`${kind}/${key}`)
            } else {
              seen.set(key, value)
            }
          }
        }
      }

      validateEndpointList(container.endpoints, where, errors, endpointState, {
        isContainer: true,
        dedicatedPod: container.dedicatedPod === true,
        partial
      })
    }

    if (component.volume && component.volume.size !== undefined && parseQuantity(component.volume.size) === null) {
      errors.push(`${where}: volume size "${component.volume.size}" is not a valid quantity (for example 2Gi, 1024Mi)`)
    }

    for (const key of ['kubernetes', 'openshift']) {
      const k8s = component[key]
      if (!k8s) continue

      const sources = ['uri', 'inlined'].filter((source) => k8s[source] !== undefined)
      if (sources.length !== 1) {
        errors.push(`${where}: exactly one of uri or inlined must be set`)
      }
      if (k8s.uri !== undefined && !isValidUri(k8s.uri)) {
        errors.push(`${where}: "${k8s.uri}" is not a valid URI`)
      }

      validateEndpointList(k8s.endpoints, where, errors, endpointState, { isContainer: false, partial })
    }

    if (component.image) {
      const image = component.image

      if (!image.imageName && !partial) {
        errors.push(`${where}: imageName is required`)
      }

      // An image override may either redefine the build or only flip autoBuild,
      // the schema rejects doing both at once.
      if (partial) {
        const overrides = ['dockerfile', 'autoBuild'].filter((key) => image[key] !== undefined)
        if (overrides.length !== 1) {
          errors.push(`${where}: an image override must set exactly one of dockerfile or autoBuild`)
        }
      } else if (!image.dockerfile) {
        errors.push(`${where}: a dockerfile build source is required`)
      }

      if (image.dockerfile) {
        const sources = ['uri', 'devfileRegistry', 'git'].filter((key) => image.dockerfile[key] !== undefined)
        if (sources.length === 0) {
          errors.push(`${where}: a dockerfile source (uri, devfileRegistry or git) must be set`)
        } else if (sources.length > 1) {
          errors.push(`${where}: only one dockerfile source (uri, devfileRegistry or git) can be set`)
        }
        if (image.dockerfile.uri !== undefined && !isValidUri(image.dockerfile.uri)) {
          errors.push(`${where}: dockerfile uri "${image.dockerfile.uri}" is not a valid URI`)
        }
        if (image.dockerfile.devfileRegistry && !image.dockerfile.devfileRegistry.id && !partial) {
          errors.push(`${where}: dockerfile devfileRegistry id is required`)
        }
        if (image.dockerfile.git) {
          validateGitRemotes(
            image.dockerfile.git,
            { label: `${where} dockerfile`, singleRemote: true, partial },
            errors
          )
        }
        if (!image.dockerfile.buildContext && !partial) {
          warnings.push(`${where}: no buildContext set for the dockerfile build`)
        }
      }
    }
  })
}

function validateCommands(commands, components, errors, warnings, { hasParent, partial, label = 'Command' } = {}) {
  if (!commands) return

  const reference = hasParent || partial ? warnings : errors

  checkDuplicates(commands.map((command) => command.id), `${label}s`, 'id', errors)

  const commandsById = new Map()
  for (const command of commands) {
    if (command.id) commandsById.set(command.id, command)
  }

  const componentsByName = new Map()
  for (const component of components || []) {
    if (component.name) componentsByName.set(component.name, component)
  }

  const groups = new Map()

  commands.forEach((command, index) => {
    const id = command.id
    const where = `${label} ${id ? `"${id}"` : `#${index + 1}`}`

    if (!id) {
      errors.push(`${where}: id is required`)
    } else if (!isValidName(id)) {
      errors.push(`${where}: id must be lowercase alphanumeric with dashes, max 63 characters`)
    }

    const types = ['exec', 'apply', 'composite'].filter((key) => command[key] !== undefined)
    if (types.length !== 1) {
      errors.push(`${where}: exactly one command type must be configured`)
      return
    }

    const [type] = types
    const body = command[type]

    if (body.group?.kind) {
      const kind = body.group.kind
      if (!groups.has(kind)) groups.set(kind, [])
      groups.get(kind).push({ id: id || `#${index + 1}`, isDefault: body.group.isDefault === true })
    }

    if (type === 'exec') {
      if (!body.commandLine && !partial) errors.push(`${where}: commandLine is required`)
      if (!body.component) {
        if (!partial) errors.push(`${where}: a component reference is required`)
      } else {
        const target = componentsByName.get(body.component)
        if (!target) {
          reference.push(`${where}: references unknown component "${body.component}"`)
        } else if (!target.container) {
          errors.push(`${where}: exec commands must reference a container component, "${body.component}" is not one`)
        }
      }
      for (const env of body.env || []) {
        if (RESERVED_ENV_NAMES.includes(env.name)) {
          errors.push(`${where}: "${env.name}" is a reserved environment variable and cannot be redefined`)
        }
      }
    }

    if (type === 'apply') {
      if (!body.component) {
        if (!partial) errors.push(`${where}: a component reference is required`)
      } else {
        const target = componentsByName.get(body.component)
        if (!target) {
          reference.push(`${where}: references unknown component "${body.component}"`)
        } else if (target.volume) {
          errors.push(
            `${where}: apply commands must reference a container, kubernetes, openshift or image component, "${body.component}" is a volume`
          )
        }
      }
    }

    if (type === 'composite') {
      if (!body.commands || body.commands.length === 0) {
        if (!partial) errors.push(`${where}: at least one sub-command is required`)
      } else {
        for (const subCommand of body.commands) {
          if (subCommand === id) {
            errors.push(`${where}: a composite command cannot reference itself`)
          } else if (!commandsById.has(subCommand)) {
            reference.push(`${where}: references unknown command "${subCommand}"`)
          }
        }
        const cycle = findCompositeCycle(id, commandsById)
        if (cycle) {
          errors.push(`${where}: a composite command cannot indirectly reference itself (${cycle.join(' -> ')})`)
        }
      }
    }
  })

  for (const [kind, groupCommands] of groups) {
    if (groupCommands.length < 2) continue
    const defaults = groupCommands.filter((command) => command.isDefault)
    if (defaults.length === 0) {
      warnings.push(`${label} group "${kind}" has ${groupCommands.length} commands but no default one`)
    } else if (defaults.length > 1) {
      errors.push(
        `${label} group "${kind}" has more than one default command: ${defaults.map((command) => `"${command.id}"`).join(', ')}`
      )
    }
  }
}

/** Depth-first search for an indirect self reference between composite commands. */
function findCompositeCycle(startId, commandsById) {
  if (!startId) return null

  const path = []
  const visiting = new Set()

  function visit(id) {
    const command = commandsById.get(id)
    if (!command?.composite) return false

    path.push(id)
    visiting.add(id)

    for (const reference of command.composite.commands || []) {
      if (reference === startId) {
        path.push(reference)
        return true
      }
      if (!visiting.has(reference) && visit(reference)) return true
    }

    path.pop()
    visiting.delete(id)
    return false
  }

  return visit(startId) && path.length > 2 ? [...path] : null
}

function validateEventList(eventType, commandIds, commandsById, errors, reference) {
  if (!commandIds) return

  const expected = eventType === 'preStart' || eventType === 'postStop' ? 'apply' : 'exec'

  for (const id of commandIds) {
    const command = commandsById.get(id)
    if (!command) {
      reference.push(`Event ${eventType}: "${id}" does not map to a devfile command`)
      continue
    }

    if (command[expected]) continue

    if (command.composite) {
      const invalid = (command.composite.commands || []).filter((reference) => {
        const sub = commandsById.get(reference)
        return sub && !sub[expected]
      })
      if (invalid.length > 0) {
        errors.push(
          `Event ${eventType}: composite command "${id}" must only contain ${expected} commands (${invalid.join(', ')})`
        )
      }
      continue
    }

    errors.push(
      `Event ${eventType}: "${id}" must be an ${expected} command, or a composite command of ${expected} commands`
    )
  }
}

function validateEvents(events, commands, errors, warnings, { hasParent } = {}) {
  if (!events) return

  const commandsById = new Map()
  for (const command of commands || []) {
    if (command.id) commandsById.set(command.id, command)
  }

  for (const eventType of ['preStart', 'postStart', 'preStop', 'postStop']) {
    validateEventList(eventType, events[eventType], commandsById, errors, hasParent ? warnings : errors)
  }
}

function validateMetadataSection(metadata, errors, warnings) {
  if (!metadata) {
    warnings.push('Metadata: no devfile name set')
    return
  }

  if (metadata.name && metadata.generateName) {
    errors.push('Metadata: name and generateName are mutually exclusive')
  }

  if (!metadata.name && !metadata.generateName) {
    warnings.push('Metadata: no devfile name set')
  }

  if (metadata.name && !isValidName(metadata.name)) {
    errors.push('Metadata: name must be lowercase alphanumeric with dashes, max 63 characters')
  }

  if (metadata.version && !METADATA_VERSION_PATTERN.test(metadata.version)) {
    errors.push(`Metadata: version "${metadata.version}" must follow semantic versioning (for example 1.0.0)`)
  }

  for (const field of ['website', 'supportUrl', 'icon']) {
    if (metadata[field] && !isValidUri(metadata[field])) {
      errors.push(`Metadata: ${field} "${metadata[field]}" is not a valid URI`)
    }
  }

  if (metadata.globalMemoryLimit && parseQuantity(metadata.globalMemoryLimit) === null) {
    errors.push(`Metadata: globalMemoryLimit "${metadata.globalMemoryLimit}" is not a valid quantity`)
  }
}

function validateParentSection(parent, errors, warnings) {
  if (!parent) return

  const sources = ['uri', 'id', 'kubernetes'].filter((key) => parent[key] !== undefined)
  if (sources.length !== 1) {
    errors.push('Parent: exactly one of uri, id or kubernetes must be set')
  }

  if (parent.uri !== undefined && !isValidUri(parent.uri)) {
    errors.push(`Parent: uri "${parent.uri}" is not a valid URI`)
  }

  if (parent.kubernetes && !parent.kubernetes.name) {
    errors.push('Parent: the kubernetes reference needs a name')
  }

  if (parent.registryUrl && !isValidUri(parent.registryUrl)) {
    errors.push(`Parent: registryUrl "${parent.registryUrl}" is not a valid URI`)
  }

  if (parent.id && !parent.registryUrl) {
    warnings.push('Parent: no registryUrl set, the default devfile registry will be used')
  }

  if (parent.version && !PARENT_VERSION_PATTERN.test(parent.version)) {
    errors.push(`Parent: version "${parent.version}" must be "latest" or a semantic version`)
  }
}

/**
 * Validates the elements of a `parent` override.
 *
 * Overrides are merged on top of the parent content, so no value is mandatory,
 * but the structural rules of the schema (names, mutually exclusive sources)
 * still apply to them.
 */
function validateParentOverrides(parent, errors, warnings) {
  if (!parent) return

  const projectLists = [
    ['projects', 'Parent project'],
    ['starterProjects', 'Parent starter project'],
    ['dependentProjects', 'Parent dependent project']
  ]

  for (const [kind, label] of projectLists) {
    validateProjects(parent[kind], { kind, label, partial: true }, errors, warnings)
  }

  validateComponents(parent.components, errors, warnings, { partial: true, label: 'Parent component' })
  validateCommands(parent.commands, parent.components, errors, warnings, {
    partial: true,
    label: 'Parent command'
  })
}

/** Reports free-form attribute fields that do not parse as YAML maps. */
function validateAttributeTexts(data, errors) {
  validateAttributeText(data.attributes, 'Devfile attributes', errors)
  validateAttributeText(data.metadata?.attributes, 'Metadata attributes', errors)

  const projectGroups = [
    ['projects', data.projects],
    ['starterProjects', data.starterProjects],
    ['dependentProjects', data.dependentProjects]
  ]

  for (const [kind, projects] of projectGroups) {
    ;(projects || []).forEach((project, index) => {
      validateAttributeText(project.attributes, `${kind}[${index + 1}] attributes`, errors)
    })
  }

  ;(data.components || []).forEach((component, index) => {
    validateAttributeText(component.attributes, `Component ${component.name || `#${index + 1}`} attributes`, errors)
    const endpoints = component.container?.endpoints || component.kubernetes?.endpoints || component.openshift?.endpoints
    ;(endpoints || []).forEach((endpoint, endpointIndex) => {
      validateAttributeText(
        endpoint.attributes,
        `Component ${component.name || `#${index + 1}`} endpoint ${endpoint.name || `#${endpointIndex + 1}`} attributes`,
        errors
      )
    })
  })

  ;(data.commands || []).forEach((command, index) => {
    validateAttributeText(command.attributes, `Command ${command.id || `#${index + 1}`} attributes`, errors)
  })

  if (data.parent) {
    validateAttributeText(data.parent.attributes, 'Parent attributes', errors)

    ;(data.parent.components || []).forEach((component, index) => {
      validateAttributeText(
        component.attributes,
        `Parent component ${component.name || `#${index + 1}`} attributes`,
        errors
      )
    })

    ;(data.parent.commands || []).forEach((command, index) => {
      validateAttributeText(command.attributes, `Parent command ${command.id || `#${index + 1}`} attributes`, errors)
    })

    for (const kind of ['projects', 'starterProjects', 'dependentProjects']) {
      ;(data.parent[kind] || []).forEach((project, index) => {
        validateAttributeText(project.attributes, `Parent ${kind}[${index + 1}] attributes`, errors)
      })
    }
  }
}

/**
 * Validates the wizard state against the devfile 2.3.0 schema and the
 * devfile/api validation rules.
 *
 * Returns blocking `errors` and non-blocking `warnings`.
 */
export function validateDevfile(data) {
  const errors = []
  const warnings = []

  validateAttributeTexts(data, errors)

  const devfile = buildDevfile(data)

  if (!devfile.schemaVersion) {
    errors.push('Schema version is required')
  } else if (!SCHEMA_VERSION_PATTERN.test(devfile.schemaVersion)) {
    errors.push(`Schema version "${devfile.schemaVersion}" is not a valid devfile schema version`)
  }

  const options = { hasParent: devfile.parent !== undefined }

  if (data.parent && devfile.parent === undefined) {
    warnings.push('Parent: no parent source configured, the section is left out of the devfile')
  }

  validateMetadataSection(devfile.metadata, errors, warnings)
  validateParentSection(devfile.parent, errors, warnings)
  validateProjects(devfile.projects, { kind: 'projects', label: 'Project' }, errors, warnings)
  validateProjects(devfile.starterProjects, { kind: 'starterProjects', label: 'Starter project' }, errors, warnings)
  validateProjects(
    devfile.dependentProjects,
    { kind: 'dependentProjects', label: 'Dependent project' },
    errors,
    warnings
  )
  validateComponents(devfile.components, errors, warnings, options)
  validateCommands(devfile.commands, devfile.components, errors, warnings, options)
  validateEvents(devfile.events, devfile.commands, errors, warnings, options)
  validateParentOverrides(devfile.parent, errors, warnings)

  return { errors, warnings }
}
