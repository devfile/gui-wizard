export const WIZARD_STEPS = [
  { id: 'metadata', title: 'Basic Information', required: true },
  { id: 'projects', title: 'Projects', required: false },
  { id: 'components', title: 'Components', required: false },
  { id: 'commands', title: 'Commands', required: false },
  { id: 'events', title: 'Events', required: false },
  { id: 'variables', title: 'Variables', required: false },
  { id: 'review', title: 'Review & Download', required: true }
]

export const LANGUAGES = [
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'Go', label: 'Go' },
  { value: 'C#', label: 'C#' },
  { value: 'C++', label: 'C++' },
  { value: 'Ruby', label: 'Ruby' },
  { value: 'PHP', label: 'PHP' },
  { value: 'Rust', label: 'Rust' },
  { value: 'Swift', label: 'Swift' },
  { value: 'Kotlin', label: 'Kotlin' }
]

export const PROJECT_TYPES = [
  { value: 'application', label: 'Application' },
  { value: 'library', label: 'Library' },
  { value: 'tool', label: 'Tool' },
  { value: 'framework', label: 'Framework' }
]

export const COMPONENT_TYPES = [
  { value: 'container', label: 'Container' },
  { value: 'volume', label: 'Volume' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'openshift', label: 'OpenShift' },
  { value: 'image', label: 'Image' }
]

export const COMMAND_TYPES = [
  { value: 'exec', label: 'Exec' },
  { value: 'apply', label: 'Apply' },
  { value: 'composite', label: 'Composite' }
]

export const COMMAND_GROUPS = [
  { value: 'build', label: 'Build' },
  { value: 'run', label: 'Run' },
  { value: 'test', label: 'Test' },
  { value: 'debug', label: 'Debug' }
]

export const ENDPOINT_PROTOCOLS = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'tcp', label: 'TCP' },
  { value: 'udp', label: 'UDP' },
  { value: 'ws', label: 'WebSocket' }
]

export const EVENT_TYPES = [
  { value: 'preStart', label: 'Pre Start' },
  { value: 'postStart', label: 'Post Start' },
  { value: 'preStop', label: 'Pre Stop' },
  { value: 'postStop', label: 'Post Stop' }
]
