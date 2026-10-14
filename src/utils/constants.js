export const DEVFILE_SCHEMA_VERSION = '2.3.0'

export const WIZARD_STEPS = [
  { id: 'metadata', title: 'Basics', heading: 'Basic Information', required: true },
  { id: 'parent', title: 'Parent', heading: 'Parent', required: false },
  { id: 'projects', title: 'Projects', heading: 'Projects', required: false },
  { id: 'components', title: 'Components', heading: 'Components', required: false },
  { id: 'commands', title: 'Commands', heading: 'Commands', required: false },
  { id: 'events', title: 'Events', heading: 'Events', required: false },
  { id: 'variables', title: 'Variables', heading: 'Variables', required: false },
  { id: 'review', title: 'Review', heading: 'Review & Download', required: true }
]

// metadata.language and metadata.projectType are free-form strings in the schema,
// these are only suggestions offered through a datalist.
export const LANGUAGE_SUGGESTIONS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'C#',
  'C++',
  'Ruby',
  'PHP',
  'Rust',
  'Swift',
  'Kotlin',
  'Scala',
  '.NET'
]

export const PROJECT_TYPE_SUGGESTIONS = [
  'application',
  'library',
  'tool',
  'framework',
  'nodejs',
  'quarkus',
  'spring',
  'django',
  'dotnet',
  'vertx'
]

// metadata.architectures enum
export const ARCHITECTURES = ['amd64', 'arm64', 'ppc64le', 's390x']

export const COMPONENT_TYPES = [
  { value: 'container', label: 'Container' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'openshift', label: 'OpenShift' },
  { value: 'volume', label: 'Volume' },
  { value: 'image', label: 'Image' }
]

export const COMMAND_TYPES = [
  { value: 'exec', label: 'Exec' },
  { value: 'apply', label: 'Apply' },
  { value: 'composite', label: 'Composite' }
]

// command group kind enum
export const COMMAND_GROUPS = [
  { value: 'build', label: 'Build' },
  { value: 'run', label: 'Run' },
  { value: 'test', label: 'Test' },
  { value: 'debug', label: 'Debug' },
  { value: 'deploy', label: 'Deploy' }
]

// endpoint protocol enum (default: http)
export const ENDPOINT_PROTOCOLS = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'ws', label: 'WebSocket (ws)' },
  { value: 'wss', label: 'Secure WebSocket (wss)' },
  { value: 'tcp', label: 'TCP' },
  { value: 'udp', label: 'UDP' }
]

// endpoint exposure enum (default: public)
export const ENDPOINT_EXPOSURES = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'none', label: 'None' }
]

export const PROJECT_SOURCE_TYPES = [
  { value: 'git', label: 'Git Repository' },
  { value: 'zip', label: 'Zip Archive' }
]

// kubernetes/openshift components take their manifest either from a uri or inlined
export const K8S_SOURCE_TYPES = [
  { value: 'uri', label: 'URI (external file)' },
  { value: 'inlined', label: 'Inlined manifest' }
]

// image component dockerfile sources
export const DOCKERFILE_SOURCE_TYPES = [
  { value: 'uri', label: 'URI' },
  { value: 'devfileRegistry', label: 'Devfile registry' },
  { value: 'git', label: 'Git repository' }
]

// An image component inside a parent override either redefines the build or
// only flips autoBuild, the schema rejects doing both at once.
export const IMAGE_OVERRIDE_TYPES = [
  { value: 'dockerfile', label: 'Dockerfile build' },
  { value: 'autoBuild', label: 'autoBuild only' }
]

export const PARENT_SOURCE_TYPES = [
  { value: 'uri', label: 'URI' },
  { value: 'id', label: 'Registry stack id' },
  { value: 'kubernetes', label: 'Kubernetes DevWorkspaceTemplate' }
]

export const EVENT_TYPES = [
  {
    value: 'preStart',
    label: 'Pre Start',
    description: 'Commands executed in an init container before the workspace starts. Must be apply commands (or composites of apply commands).',
    allowed: 'apply'
  },
  {
    value: 'postStart',
    label: 'Post Start',
    description: 'Commands executed after the workspace starts. Must be exec commands (or composites of exec commands).',
    allowed: 'exec'
  },
  {
    value: 'preStop',
    label: 'Pre Stop',
    description: 'Commands executed before the workspace stops. Must be exec commands (or composites of exec commands).',
    allowed: 'exec'
  },
  {
    value: 'postStop',
    label: 'Post Stop',
    description: 'Commands executed after the workspace stops. Must be apply commands (or composites of apply commands).',
    allowed: 'apply'
  }
]

// Environment variables that are set by the platform and must not be redefined
// in a container component's env list.
export const RESERVED_ENV_NAMES = ['PROJECT_SOURCE', 'PROJECTS_ROOT']

// Shared by component names, command ids, project names and endpoint names.
export const K8S_NAME_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/

export const SCHEMA_VERSION_PATTERN =
  /^([2-9])\.([0-9]+)\.([0-9]+)(-[0-9a-z-]+(\.[0-9a-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/

export const METADATA_VERSION_PATTERN =
  /^([0-9]+)\.([0-9]+)\.([0-9]+)(-[0-9a-z-]+(\.[0-9a-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/

export const PARENT_VERSION_PATTERN =
  /^(latest)|(([1-9])\.([0-9]+)\.([0-9]+)(-[0-9a-z-]+(\.[0-9a-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?)$/
