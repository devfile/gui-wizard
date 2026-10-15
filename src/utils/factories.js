import { DEVFILE_SCHEMA_VERSION } from './constants'

/**
 * Factories for every editable devfile element.
 *
 * Conventions used by the wizard state (see devfileGenerator.js for the
 * matching serializer):
 *
 *  - `null` means "this optional sub-object is not selected" (e.g. a project
 *    that uses a git source keeps `zip: null`). The serializer never emits it.
 *  - `''` means "selected but empty" and is dropped from the generated YAML.
 *  - `undefined` for a boolean means "not set" so that parent overrides can
 *    distinguish between an unset flag and an explicit `false`.
 *  - string -> string maps (git remotes, annotations, variables) are kept as
 *    ordered `[{ key, value }]` arrays so that keys stay editable.
 *  - free-form `attributes` are kept as raw YAML text and parsed on serialize.
 *  - elements of the reorderable lists carry a `_uid` so that React can keep
 *    editor state with the item and not with its position. It is wizard-only
 *    state; the serializer walks the schema and never emits it.
 *
 * `partial` marks elements that live under `parent` overrides, where no field
 * is required and booleans must stay tri-state.
 */

export const COMPONENT_TYPE_KEYS = ['container', 'kubernetes', 'openshift', 'volume', 'image']
export const COMMAND_TYPE_KEYS = ['exec', 'apply', 'composite']
export const PROJECT_KINDS = ['projects', 'starterProjects', 'dependentProjects']

let uidCounter = 0

export function nextUid() {
  uidCounter += 1
  return `uid-${uidCounter}`
}

export function createKeyValue(key = '', value = '') {
  return { key, value }
}

export function createEnvVar() {
  return { name: '', value: '' }
}

export function createVolumeMount() {
  return { name: '', path: '' }
}

export function createEndpoint() {
  return {
    _uid: nextUid(),
    name: '',
    targetPort: '',
    exposure: '',
    protocol: '',
    path: '',
    secure: false,
    annotation: [],
    attributes: ''
  }
}

export function createContainer(partial = false) {
  return {
    image: '',
    command: [],
    args: [],
    env: [],
    volumeMounts: [],
    endpoints: [],
    memoryRequest: '',
    memoryLimit: '',
    cpuRequest: '',
    cpuLimit: '',
    mountSources: partial ? undefined : true,
    sourceMapping: '',
    dedicatedPod: partial ? undefined : false,
    annotation: { deployment: [], service: [] }
  }
}

export function createVolume(partial = false) {
  return {
    size: '',
    ephemeral: partial ? undefined : false
  }
}

export function createK8sLike() {
  return {
    uri: '',
    inlined: null,
    deployByDefault: undefined,
    endpoints: []
  }
}

export function createGitSource() {
  return {
    remotes: [createKeyValue('origin', '')],
    checkoutFrom: { remote: '', revision: '' }
  }
}

export function createDockerfile(partial = false) {
  return {
    uri: '',
    devfileRegistry: null,
    git: null,
    buildContext: '',
    rootRequired: partial ? undefined : false,
    args: []
  }
}

export function createImage(partial = false) {
  return {
    imageName: '',
    autoBuild: undefined,
    dockerfile: createDockerfile(partial)
  }
}

/**
 * Inside a parent override an image component either redefines the build or
 * only flips `autoBuild`; the schema rejects setting both.
 */
export function getImageOverrideType(image) {
  return image && image.dockerfile == null ? 'autoBuild' : 'dockerfile'
}

export function applyImageOverrideType(image, type) {
  if (type === 'autoBuild') {
    return { ...image, dockerfile: null, autoBuild: image.autoBuild ?? true }
  }
  return { ...image, autoBuild: undefined, dockerfile: image.dockerfile || createDockerfile(true) }
}

export function createComponent(type = 'container', partial = false) {
  const component = { name: '', attributes: '' }
  return applyComponentType(component, type, partial)
}

export function applyComponentType(component, type, partial = false) {
  const next = {
    _uid: component._uid || nextUid(),
    name: component.name || '',
    attributes: component.attributes || ''
  }

  switch (type) {
    case 'volume':
      next.volume = createVolume(partial)
      break
    case 'kubernetes':
      next.kubernetes = createK8sLike()
      break
    case 'openshift':
      next.openshift = createK8sLike()
      break
    case 'image':
      next.image = createImage(partial)
      break
    case 'container':
    default:
      next.container = createContainer(partial)
      break
  }

  return next
}

export function getComponentType(component) {
  if (!component) return 'container'
  return COMPONENT_TYPE_KEYS.find((key) => component[key] != null) || 'container'
}

export function createCommandGroup(partial = false) {
  return { kind: '', isDefault: partial ? undefined : false }
}

export function createCommand(type = 'exec', partial = false) {
  const command = { id: '', attributes: '' }
  return applyCommandType(command, type, partial)
}

export function applyCommandType(command, type, partial = false) {
  const next = {
    _uid: command._uid || nextUid(),
    id: command.id || '',
    attributes: command.attributes || ''
  }

  switch (type) {
    case 'apply':
      next.apply = {
        component: '',
        label: '',
        group: createCommandGroup(partial)
      }
      break
    case 'composite':
      next.composite = {
        commands: [],
        parallel: partial ? undefined : false,
        label: '',
        group: createCommandGroup(partial)
      }
      break
    case 'exec':
    default:
      next.exec = {
        component: '',
        commandLine: '',
        workingDir: '',
        env: [],
        label: '',
        group: createCommandGroup(partial),
        hotReloadCapable: partial ? undefined : false
      }
      break
  }

  return next
}

export function getCommandType(command) {
  if (!command) return 'exec'
  return COMMAND_TYPE_KEYS.find((key) => command[key] != null) || 'exec'
}

export function createProject(kind = 'projects') {
  const project = { _uid: nextUid(), name: '', attributes: '' }

  if (kind === 'starterProjects') {
    project.description = ''
    project.subDir = ''
  } else {
    project.clonePath = ''
  }

  project.git = createGitSource()
  project.zip = null

  return project
}

export function applyProjectSourceType(project, type) {
  if (type === 'zip') {
    return { ...project, git: null, zip: project.zip || { location: '' } }
  }
  return { ...project, zip: null, git: project.git || createGitSource() }
}

export function getProjectSourceType(project) {
  return project && project.zip != null ? 'zip' : 'git'
}

export function getK8sSourceType(k8s) {
  return k8s && k8s.inlined != null ? 'inlined' : 'uri'
}

export function applyK8sSourceType(k8s, type) {
  if (type === 'inlined') {
    return { ...k8s, uri: null, inlined: k8s.inlined ?? '' }
  }
  return { ...k8s, inlined: null, uri: k8s.uri ?? '' }
}

export function getDockerfileSourceType(dockerfile) {
  if (!dockerfile) return 'uri'
  if (dockerfile.devfileRegistry != null) return 'devfileRegistry'
  if (dockerfile.git != null) return 'git'
  return 'uri'
}

export function applyDockerfileSourceType(dockerfile, type) {
  const next = { ...dockerfile, uri: null, devfileRegistry: null, git: null }

  switch (type) {
    case 'devfileRegistry':
      next.devfileRegistry = dockerfile.devfileRegistry || { id: '', registryUrl: '' }
      break
    case 'git':
      next.git = dockerfile.git || { ...createGitSource(), fileLocation: '' }
      break
    case 'uri':
    default:
      next.uri = dockerfile.uri ?? ''
      break
  }

  return next
}

export function createParent() {
  return {
    uri: '',
    id: null,
    kubernetes: null,
    registryUrl: '',
    version: '',
    variables: [],
    attributes: '',
    components: [],
    commands: [],
    projects: [],
    starterProjects: [],
    dependentProjects: []
  }
}

export function getParentSourceType(parent) {
  if (!parent) return 'uri'
  if (parent.id != null) return 'id'
  if (parent.kubernetes != null) return 'kubernetes'
  return 'uri'
}

export function applyParentSourceType(parent, type) {
  const next = { ...parent, uri: null, id: null, kubernetes: null }

  switch (type) {
    case 'id':
      next.id = parent.id ?? ''
      break
    case 'kubernetes':
      next.kubernetes = parent.kubernetes || { name: '', namespace: '' }
      break
    case 'uri':
    default:
      next.uri = parent.uri ?? ''
      break
  }

  return next
}

export function createInitialDevfileData() {
  return {
    schemaVersion: DEVFILE_SCHEMA_VERSION,
    metadata: {
      name: '',
      generateName: '',
      version: '',
      displayName: '',
      description: '',
      icon: '',
      language: '',
      projectType: '',
      provider: '',
      tags: [],
      architectures: [],
      website: '',
      supportUrl: '',
      globalMemoryLimit: '',
      attributes: ''
    },
    attributes: '',
    parent: null,
    projects: [],
    starterProjects: [],
    dependentProjects: [],
    components: [],
    commands: [],
    events: {
      preStart: [],
      postStart: [],
      preStop: [],
      postStop: []
    },
    variables: []
  }
}
