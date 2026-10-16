import { expect, test } from '@playwright/test'
import { validateDevfile } from '../../src/utils/devfileGenerator'
import {
  createCommand,
  createComponent,
  createInitialDevfileData,
  createParent,
  createProject
} from '../../src/utils/factories'
import { fullCoverageState } from './fixtures/devfile-states'

/** A wizard state with a name and the given sections filled in. */
function state(sections = {}) {
  const data = createInitialDevfileData()
  data.metadata.name = 'sample'
  return { ...data, ...sections }
}

function container(name, overrides = {}) {
  const component = createComponent('container')
  component.name = name
  component.container.image = 'quay.io/devfile/base-developer-image:ubi10-latest'
  Object.assign(component.container, overrides)
  return component
}

function exec(id, overrides = {}) {
  const command = createCommand('exec')
  command.id = id
  command.exec.component = 'tools'
  command.exec.commandLine = 'make'
  Object.assign(command.exec, overrides)
  return command
}

function errorsOf(data) {
  return validateDevfile(data).errors
}

function warningsOf(data) {
  return validateDevfile(data).warnings
}

/** Asserts that exactly one message mentions the given fragment. */
function expectMessage(messages, fragment) {
  expect(messages.filter((message) => message.includes(fragment)), messages.join('\n')).toHaveLength(1)
}

test.describe('schema version and metadata', () => {
  test('the schema version is required and must be a devfile version', () => {
    expectMessage(errorsOf(state({ schemaVersion: '' })), 'Schema version is required')
    expectMessage(errorsOf(state({ schemaVersion: '1.0.0' })), 'is not a valid devfile schema version')
  })

  test('name and generateName are mutually exclusive', () => {
    const data = state()
    data.metadata.generateName = 'sample-'

    expectMessage(errorsOf(data), 'name and generateName are mutually exclusive')
  })

  test('a devfile without any name only warns', () => {
    const data = createInitialDevfileData()

    expect(errorsOf(data)).toEqual([])
    expectMessage(warningsOf(data), 'no devfile name set')
  })

  test('names, versions, URIs and quantities are checked', () => {
    const data = state()
    data.metadata.name = 'Not A Name'
    data.metadata.version = 'one'
    data.metadata.website = 'not a url'
    data.metadata.globalMemoryLimit = 'plenty'

    const errors = errorsOf(data)

    expectMessage(errors, 'name must be lowercase alphanumeric')
    expectMessage(errors, 'must follow semantic versioning')
    expectMessage(errors, 'website "not a url" is not a valid URI')
    expectMessage(errors, 'globalMemoryLimit "plenty" is not a valid quantity')
  })

  test('attributes that are not a YAML map are reported', () => {
    const data = state()
    data.attributes = 'key: [unterminated'

    expectMessage(errorsOf(data), 'Devfile attributes: invalid attributes YAML')
  })
})

test.describe('projects', () => {
  test('a name is required and must be unique', () => {
    const first = createProject('projects')
    const second = createProject('projects')
    first.git.remotes = [{ key: 'origin', value: 'https://github.com/devfile/api.git' }]
    second.git.remotes = [{ key: 'origin', value: 'https://github.com/devfile/api.git' }]
    first.name = 'sample'
    second.name = 'sample'

    expectMessage(errorsOf(state({ projects: [first, second] })), 'duplicate name "sample"')

    first.name = ''
    expectMessage(errorsOf(state({ projects: [first] })), 'name is required')
  })

  test('a git source needs a remote, and a checkout remote when there are several', () => {
    const project = createProject('projects')
    project.name = 'sample'
    project.git.remotes = []

    expectMessage(errorsOf(state({ projects: [project] })), 'needs at least one remote')

    project.git.remotes = [
      { key: 'origin', value: 'https://github.com/devfile/api.git' },
      { key: 'fork', value: 'https://github.com/ibuziuk/api.git' }
    ]
    expectMessage(errorsOf(state({ projects: [project] })), 'checkoutFrom.remote is required')

    project.git.checkoutFrom.remote = 'upstream'
    expectMessage(errorsOf(state({ projects: [project] })), 'is not one of the configured remotes')

    project.git.checkoutFrom.remote = 'fork'
    expect(errorsOf(state({ projects: [project] }))).toEqual([])
  })

  test('a starter project only accepts a single remote', () => {
    const starter = createProject('starterProjects')
    starter.name = 'starter'
    starter.git.remotes = [
      { key: 'origin', value: 'https://github.com/devfile/api.git' },
      { key: 'fork', value: 'https://github.com/ibuziuk/api.git' }
    ]

    expectMessage(errorsOf(state({ starterProjects: [starter] })), 'can only have one remote')
  })

  test('a remote without a URL is reported', () => {
    const project = createProject('projects')
    project.name = 'sample'

    // The editor starts a project off with an empty "origin" remote.
    expectMessage(errorsOf(state({ projects: [project] })), 'git remote "origin" has no URL')
  })

  test('two remotes cannot share a name', () => {
    const project = createProject('projects')
    project.name = 'sample'
    project.git.remotes = [
      { key: 'origin', value: 'https://github.com/devfile/api.git' },
      { key: 'origin', value: 'https://github.com/ibuziuk/api.git' }
    ]

    // Serializing keeps the last one, so the first would be lost silently.
    expectMessage(errorsOf(state({ projects: [project] })), 'duplicate git remote "origin"')
  })

  test('a zip source without a location warns', () => {
    const project = createProject('projects')
    project.name = 'sample'
    project.git = null
    project.zip = { location: '' }

    expectMessage(warningsOf(state({ projects: [project] })), 'zip source has no location')
  })
})

test.describe('components', () => {
  test('a container needs an image and a unique, valid name', () => {
    const component = container('tools', { image: '' })

    expectMessage(errorsOf(state({ components: [component] })), 'container image is required')

    component.name = 'Tools'
    expectMessage(errorsOf(state({ components: [component] })), 'name must be lowercase alphanumeric')

    expectMessage(errorsOf(state({ components: [container('tools'), container('tools')] })), 'duplicate name "tools"')
  })

  test('reserved environment variables cannot be redefined', () => {
    const component = container('tools', { env: [{ name: 'PROJECT_SOURCE', value: '/projects' }] })

    expectMessage(errorsOf(state({ components: [component] })), '"PROJECT_SOURCE" is a reserved environment variable')
  })

  test('resource quantities are parsed and compared', () => {
    const component = container('tools', { memoryLimit: 'lots' })
    expectMessage(errorsOf(state({ components: [component] })), 'memoryLimit "lots" is not a valid quantity')

    const tight = container('tools', { memoryRequest: '2Gi', memoryLimit: '1Gi', cpuRequest: '2', cpuLimit: '500m' })
    const errors = errorsOf(state({ components: [tight] }))
    expectMessage(errors, 'memoryRequest is greater than memoryLimit')
    expectMessage(errors, 'cpuRequest is greater than cpuLimit')
  })

  test('a volume mount must reference a volume component', () => {
    const component = container('tools', { volumeMounts: [{ name: 'm2', path: '/home/user/.m2' }] })

    expectMessage(errorsOf(state({ components: [component] })), 'does not reference a volume component')

    const volume = createComponent('volume')
    volume.name = 'm2'
    expect(errorsOf(state({ components: [component, volume] }))).toEqual([])
  })

  test('a volume mount name must be a valid name', () => {
    const component = container('tools', { volumeMounts: [{ name: 'Not A Name', path: '/data' }] })

    expectMessage(
      errorsOf(state({ components: [component] })),
      'volume mount name "Not A Name" must be lowercase alphanumeric'
    )
  })

  test('entries that would be dropped on serialization are reported', () => {
    const nameless = container('tools', {
      env: [{ name: '', value: 'lost' }],
      volumeMounts: [{ name: '', path: '/data' }],
      annotation: { deployment: [{ key: '', value: 'lost' }], service: [] }
    })

    const errors = errorsOf(state({ components: [nameless] }))
    expectMessage(errors, 'an environment variable has a value but no name')
    expectMessage(errors, 'a volume mount has a value but no name')
    expectMessage(errors, 'a deployment annotation has a value but no name')
  })

  test('containers sharing the pod cannot give the same annotation two values', () => {
    const annotated = (name, value) =>
      container(name, { annotation: { deployment: [{ key: 'owner', value }], service: [] } })

    expectMessage(
      errorsOf(state({ components: [annotated('tools', 'a'), annotated('other', 'b')] })),
      'conflicting values to the deployment annotation "owner"'
    )

    expect(errorsOf(state({ components: [annotated('tools', 'a'), annotated('other', 'a')] }))).toEqual([])

    // A container in its own pod annotates its own deployment.
    const dedicated = annotated('other', 'b')
    dedicated.container.dedicatedPod = true
    expect(errorsOf(state({ components: [annotated('tools', 'a'), dedicated] }))).toEqual([])
  })

  test('endpoints are named, unique across components and bound to a valid port', () => {
    const withEndpoint = (name, endpoint) => container(name, { endpoints: [endpoint] })

    expectMessage(
      errorsOf(state({ components: [withEndpoint('tools', { name: '', targetPort: 8080 })] })),
      'name is required'
    )
    expectMessage(
      errorsOf(state({ components: [withEndpoint('tools', { name: 'a-very-long-endpoint', targetPort: 8080 })] })),
      'max 15 characters'
    )
    expectMessage(
      errorsOf(state({ components: [withEndpoint('tools', { name: 'http', targetPort: '' })] })),
      'targetPort is required'
    )
    expectMessage(
      errorsOf(state({ components: [withEndpoint('tools', { name: 'http', targetPort: 70000 })] })),
      'targetPort must be between 1 and 65535'
    )

    const duplicated = state({
      components: [
        withEndpoint('tools', { name: 'http', targetPort: 8080 }),
        withEndpoint('other', { name: 'http', targetPort: 9090 })
      ]
    })
    expectMessage(errorsOf(duplicated), 'endpoint names must be unique across all components')
  })

  test('two containers cannot expose the same port unless one has a dedicated pod', () => {
    const first = container('tools', { endpoints: [{ name: 'http-a', targetPort: 8080 }] })
    const second = container('other', { endpoints: [{ name: 'http-b', targetPort: 8080 }] })

    expectMessage(errorsOf(state({ components: [first, second] })), 'is already used by another container component')

    second.container.dedicatedPod = true
    expect(errorsOf(state({ components: [first, second] }))).toEqual([])
  })

  test('kubernetes and openshift components take exactly one manifest source', () => {
    const component = createComponent('kubernetes')
    component.name = 'k8s'
    component.kubernetes.uri = ''

    expectMessage(errorsOf(state({ components: [component] })), 'exactly one of uri or inlined must be set')

    component.kubernetes.uri = 'https://not a url'
    expectMessage(errorsOf(state({ components: [component] })), 'is not a valid URI')
  })

  test('an inlined manifest must be valid YAML', () => {
    const component = createComponent('kubernetes')
    component.name = 'k8s'
    component.kubernetes.uri = null
    component.kubernetes.inlined = 'kind: [Deployment'

    expectMessage(errorsOf(state({ components: [component] })), 'the inlined manifest is not valid YAML')

    // Several documents in one manifest are allowed.
    component.kubernetes.inlined = 'kind: Deployment\n---\nkind: Service'
    expect(errorsOf(state({ components: [component] }))).toEqual([])
  })

  test('an image component needs a name and exactly one dockerfile source', () => {
    const component = createComponent('image')
    component.name = 'my-image'

    let errors = errorsOf(state({ components: [component] }))
    expectMessage(errors, 'imageName is required')
    expectMessage(errors, 'a dockerfile source (uri, devfileRegistry or git) must be set')

    component.image.imageName = 'quay.io/org/app:latest'
    component.image.dockerfile.uri = 'Dockerfile'
    component.image.dockerfile.devfileRegistry = { id: 'nodejs', registryUrl: '' }

    expectMessage(
      errorsOf(state({ components: [component] })),
      'only one dockerfile source (uri, devfileRegistry or git) can be set'
    )

    component.image.dockerfile.uri = null
    expectMessage(warningsOf(state({ components: [component] })), 'no buildContext set')
  })
})

test.describe('commands', () => {
  const tools = () => container('tools')

  test('an id is required, valid and unique', () => {
    expectMessage(errorsOf(state({ components: [tools()], commands: [exec('')] })), 'id is required')
    expectMessage(errorsOf(state({ components: [tools()], commands: [exec('Build')] })), 'id must be lowercase')
    expectMessage(
      errorsOf(state({ components: [tools()], commands: [exec('build'), exec('build')] })),
      'duplicate id "build"'
    )
  })

  test('an exec command needs a command line and a container component', () => {
    expectMessage(
      errorsOf(state({ components: [tools()], commands: [exec('build', { commandLine: '' })] })),
      'commandLine is required'
    )
    expectMessage(
      errorsOf(state({ components: [tools()], commands: [exec('build', { component: '' })] })),
      'a component reference is required'
    )
    expectMessage(
      errorsOf(state({ components: [tools()], commands: [exec('build', { component: 'missing' })] })),
      'references unknown component "missing"'
    )

    const volume = createComponent('volume')
    volume.name = 'm2'
    expectMessage(
      errorsOf(state({ components: [tools(), volume], commands: [exec('build', { component: 'm2' })] })),
      'exec commands must reference a container component'
    )
  })

  test('an apply command targets a deployable component, not a volume', () => {
    const volume = createComponent('volume')
    volume.name = 'm2'

    const apply = createCommand('apply')
    apply.id = 'deploy'
    apply.apply.component = 'm2'

    expectMessage(
      errorsOf(state({ components: [volume], commands: [apply] })),
      'apply commands must reference a container, kubernetes, openshift or image component'
    )

    const image = createComponent('image')
    image.name = 'app-image'
    image.image.imageName = 'quay.io/org/app:latest'
    image.image.dockerfile.uri = 'Dockerfile'
    image.image.dockerfile.buildContext = '.'
    apply.apply.component = 'app-image'

    expect(errorsOf(state({ components: [volume, image], commands: [apply] }))).toEqual([])
  })

  test('a composite command cannot reference itself, directly or indirectly', () => {
    const composite = createCommand('composite')
    composite.id = 'all'
    composite.composite.commands = ['all']

    expectMessage(errorsOf(state({ commands: [composite] })), 'cannot reference itself')

    const first = createCommand('composite')
    first.id = 'first'
    first.composite.commands = ['second']
    const second = createCommand('composite')
    second.id = 'second'
    second.composite.commands = ['first']

    // The cycle is reported on both commands taking part in it.
    const cycleErrors = errorsOf(state({ commands: [first, second] }))
    expect(cycleErrors).toEqual([
      'Command "first": a composite command cannot indirectly reference itself (first -> second -> first)',
      'Command "second": a composite command cannot indirectly reference itself (second -> first -> second)'
    ])
  })

  test('a command group has at most one default command', () => {
    const build = exec('build', { group: { kind: 'build', isDefault: true } })
    const rebuild = exec('rebuild', { group: { kind: 'build', isDefault: true } })

    expectMessage(
      errorsOf(state({ components: [tools()], commands: [build, rebuild] })),
      'has more than one default command'
    )

    rebuild.exec.group.isDefault = false
    build.exec.group.isDefault = false
    expectMessage(
      warningsOf(state({ components: [tools()], commands: [build, rebuild] })),
      'has 2 commands but no default one'
    )
  })
})

test.describe('events', () => {
  test('preStart and postStop only accept apply commands', () => {
    const data = state({
      components: [container('tools')],
      commands: [exec('build')],
      events: { preStart: ['build'], postStart: [], preStop: [], postStop: [] }
    })

    expectMessage(errorsOf(data), 'Event preStart: "build" must be an apply command')
  })

  test('postStart and preStop accept exec commands and composites of exec commands', () => {
    const composite = createCommand('composite')
    composite.id = 'all'
    composite.composite.commands = ['build']

    const data = state({
      components: [container('tools')],
      commands: [exec('build'), composite],
      events: { preStart: [], postStart: ['all'], preStop: ['build'], postStop: [] }
    })

    expect(errorsOf(data)).toEqual([])
  })

  test('binding the same command twice warns', () => {
    const data = state({
      components: [container('tools')],
      commands: [exec('build')],
      events: { preStart: [], postStart: ['build', 'build'], preStop: [], postStop: [] }
    })

    expect(errorsOf(data)).toEqual([])
    expectMessage(warningsOf(data), 'Event postStart: "build" is bound more than once')
  })

  test('an unknown command id is reported', () => {
    const data = state({
      events: { preStart: [], postStart: ['missing'], preStop: [], postStop: [] }
    })

    expectMessage(errorsOf(data), 'does not map to a devfile command')
  })
})

test.describe('parent', () => {
  test('a devfile without a parent is not reported', () => {
    expect(warningsOf(state()).filter((message) => message.startsWith('Parent'))).toEqual([])

    // An empty parent section produces no devfile content, which is the same
    // as not inheriting at all.
    const data = state({ parent: { ...createParent(), uri: '' } })
    expect(warningsOf(data).filter((message) => message.startsWith('Parent'))).toEqual([])
    expect(errorsOf(data).filter((message) => message.startsWith('Parent'))).toEqual([])
  })

  test('exactly one parent source is required', () => {
    const data = state({ parent: { ...createParent(), uri: 'https://example.com/devfile.yaml', id: 'nodejs' } })
    expectMessage(errorsOf(data), 'exactly one of uri, id or kubernetes must be set')

    // Overrides without a source would be dropped silently.
    data.parent = { ...createParent(), uri: '', components: [container('tools')] }
    expectMessage(errorsOf(data), 'exactly one of uri, id or kubernetes must be set')
  })

  test('the parent fields are checked', () => {
    const data = state({ parent: { ...createParent(), uri: 'https://not a url' } })
    expectMessage(errorsOf(data), 'uri "https://not a url" is not a valid URI')

    data.parent = { ...createParent(), uri: null, kubernetes: { name: '', namespace: 'ns' } }
    expectMessage(errorsOf(data), 'the kubernetes reference needs a name')

    data.parent = { ...createParent(), uri: null, id: 'nodejs', version: 'one' }
    expectMessage(errorsOf(data), 'version "one" must be "latest" or a semantic version')
    expectMessage(warningsOf(data), 'no registryUrl set')
  })

  test('references that the parent may provide are warnings instead of errors', () => {
    const data = state({
      parent: { ...createParent(), uri: 'https://example.com/devfile.yaml' },
      commands: [exec('build', { component: 'inherited' })]
    })

    expect(errorsOf(data)).toEqual([])
    expectMessage(warningsOf(data), 'references unknown component "inherited"')
  })

  test('overrides do not require the fields a top level element needs', () => {
    const parent = createParent()
    parent.uri = 'https://example.com/devfile.yaml'

    const component = createComponent('container', true)
    component.name = 'tools'
    parent.components = [component]

    const command = createCommand('exec', true)
    command.id = 'build'
    parent.commands = [command]

    expect(errorsOf(state({ parent }))).toEqual([])
  })

  test('an override still needs a name and one component type', () => {
    const parent = createParent()
    parent.uri = 'https://example.com/devfile.yaml'
    parent.components = [createComponent('container', true), createComponent('container', true)]

    const errors = errorsOf(state({ parent }))
    expect(errors.filter((error) => error.includes('name is required'))).toHaveLength(2)
    expect(errors.every((error) => error.startsWith('Parent'))).toBe(true)
  })

  test('an image override sets either a dockerfile or autoBuild, never both', () => {
    const parent = createParent()
    parent.uri = 'https://example.com/devfile.yaml'

    const component = createComponent('image', true)
    component.name = 'my-image'
    component.image.dockerfile.uri = 'Dockerfile'
    component.image.autoBuild = true
    parent.components = [component]

    expectMessage(errorsOf(state({ parent })), 'must set exactly one of dockerfile or autoBuild')

    component.image.autoBuild = undefined
    expect(errorsOf(state({ parent }))).toEqual([])

    component.image.dockerfile = null
    component.image.autoBuild = false
    expect(errorsOf(state({ parent }))).toEqual([])
  })
})

test.describe('variables', () => {
  test('a variable needs a unique name', () => {
    expectMessage(
      errorsOf(state({ variables: [{ key: 'version', value: '1' }, { key: 'version', value: '2' }] })),
      'Variables: duplicate variable "version"'
    )

    expectMessage(
      errorsOf(state({ variables: [{ key: '', value: '1.0.0' }] })),
      'Variables: a variable has a value but no name'
    )
  })

  test('a name that is awkward to reference warns', () => {
    const data = state({ variables: [{ key: 'java version', value: '21' }] })

    expect(errorsOf(data)).toEqual([])
    expectMessage(warningsOf(data), 'should only use alphanumeric characters, dashes and underscores')
  })

  test('parent variable overrides are checked too', () => {
    const parent = createParent()
    parent.uri = 'https://example.com/devfile.yaml'
    parent.variables = [{ key: 'version', value: '1' }, { key: 'version', value: '2' }]

    expectMessage(errorsOf(state({ parent })), 'Parent variables: duplicate variable "version"')
  })
})

test.describe('a complete devfile', () => {
  test('passes validation', () => {
    expect(validateDevfile(fullCoverageState())).toEqual({ errors: [], warnings: [] })
  })
})
