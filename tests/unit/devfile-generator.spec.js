import { expect, test } from '@playwright/test'
import yaml from 'js-yaml'
import {
  buildCommand,
  buildComponent,
  buildDevfile,
  buildProject,
  generateYaml,
  parseAttributes,
  parseQuantity
} from '../../src/utils/devfileGenerator'
import {
  createCommand,
  createComponent,
  createInitialDevfileData,
  createParent,
  createProject
} from '../../src/utils/factories'
import { fullCoverageState } from './fixtures/devfile-states'

test.describe('serialization', () => {
  test('an untouched wizard only produces the schema version', () => {
    expect(buildDevfile(createInitialDevfileData())).toEqual({ schemaVersion: '2.3.0' })
  })

  test('blank values are left out and strings are trimmed', () => {
    const data = createInitialDevfileData()
    data.metadata.name = '  my-project  '
    data.metadata.displayName = '   '
    data.metadata.tags = ['java', '  ', 'quarkus']

    expect(buildDevfile(data).metadata).toEqual({ name: 'my-project', tags: ['java', 'quarkus'] })
  })

  test('empty sections are dropped instead of being emitted empty', () => {
    const data = createInitialDevfileData()
    data.components = [createComponent('container')]
    data.components[0].name = 'tools'
    data.components[0].container.image = 'quay.io/devfile/base-developer-image:ubi10-latest'

    const devfile = buildDevfile(data)

    expect(Object.keys(devfile)).toEqual(['schemaVersion', 'components'])
    expect(devfile.components[0].container).toEqual({
      image: 'quay.io/devfile/base-developer-image:ubi10-latest',
      mountSources: true
    })
  })

  test('booleans that default to false are only emitted when true', () => {
    const component = createComponent('volume')
    component.name = 'm2'

    expect(buildComponent(component).volume).toEqual({})

    component.volume.ephemeral = true
    expect(buildComponent(component).volume).toEqual({ ephemeral: true })
  })

  test('tri-state booleans keep an explicit false', () => {
    const component = createComponent('kubernetes')
    component.name = 'k8s'
    component.kubernetes.uri = 'manifest.yaml'
    component.kubernetes.deployByDefault = false

    expect(buildComponent(component).kubernetes).toEqual({ uri: 'manifest.yaml', deployByDefault: false })
  })

  test('parent overrides keep a false boolean that top level components drop', () => {
    const component = createComponent('container', true)
    component.name = 'tools'
    component.container.dedicatedPod = false
    component.container.mountSources = false

    expect(buildComponent(component, true).container).toEqual({ dedicatedPod: false, mountSources: false })
    expect(buildComponent(component, false).container).toEqual({ mountSources: false })
  })

  test('key/value lists become maps, keeping the last value of a repeated key', () => {
    const data = createInitialDevfileData()
    data.variables = [
      { key: 'VERSION', value: '1.0.0' },
      { key: '', value: 'dropped' },
      { key: 'VERSION', value: '2.0.0' }
    ]

    expect(buildDevfile(data).variables).toEqual({ VERSION: '2.0.0' })
  })

  test('environment variables keep an empty value', () => {
    const command = createCommand('exec')
    command.id = 'build'
    command.exec.component = 'tools'
    command.exec.commandLine = 'make'
    command.exec.env = [{ name: 'DEBUG', value: '' }, { name: '', value: 'dropped' }]

    expect(buildCommand(command).exec.env).toEqual([{ name: 'DEBUG', value: '' }])
  })

  test('only the selected component type is emitted', () => {
    const component = createComponent('image')
    component.name = 'my-image'
    component.image.imageName = 'quay.io/org/app:latest'
    component.image.dockerfile.uri = 'Dockerfile'

    const built = buildComponent(component)

    expect(Object.keys(built)).toEqual(['name', 'image'])
    expect(built.image.dockerfile).toEqual({ uri: 'Dockerfile' })
  })

  test('only the selected command type is emitted', () => {
    const command = createCommand('composite')
    command.id = 'all'
    command.composite.commands = ['build', 'test']

    expect(buildCommand(command)).toEqual({ id: 'all', composite: { commands: ['build', 'test'] } })
  })

  test('a project uses either a git or a zip source', () => {
    const project = createProject('projects')
    project.name = 'sample'
    project.git.remotes = [{ key: 'origin', value: 'https://github.com/devfile/api.git' }]

    expect(buildProject(project)).toEqual({
      name: 'sample',
      git: { remotes: { origin: 'https://github.com/devfile/api.git' } }
    })

    project.git = null
    project.zip = { location: 'https://example.com/a.zip' }

    expect(buildProject(project)).toEqual({ name: 'sample', zip: { location: 'https://example.com/a.zip' } })
  })

  test('starter projects carry description and subDir instead of clonePath', () => {
    const starter = createProject('starterProjects')
    starter.name = 'starter'
    starter.description = 'A starter'
    starter.subDir = 'examples'
    starter.clonePath = 'ignored'
    starter.git.remotes = [{ key: 'origin', value: 'https://github.com/devfile/api.git' }]

    const built = buildProject(starter, 'starterProjects')

    expect(built.description).toBe('A starter')
    expect(built.subDir).toBe('examples')
    expect(built.clonePath).toBeUndefined()
  })

  test('registryUrl and version are only emitted for a parent referenced by id', () => {
    const data = createInitialDevfileData()
    data.parent = { ...createParent(), uri: 'https://example.com/devfile.yaml', registryUrl: 'https://registry.devfile.io', version: '1.0.0' }

    expect(buildDevfile(data).parent).toEqual({ uri: 'https://example.com/devfile.yaml' })

    data.parent = { ...createParent(), uri: null, id: 'nodejs', registryUrl: 'https://registry.devfile.io', version: '1.0.0' }

    expect(buildDevfile(data).parent).toEqual({
      id: 'nodejs',
      registryUrl: 'https://registry.devfile.io',
      version: '1.0.0'
    })
  })
})

test.describe('attributes', () => {
  test('free-form YAML is parsed into the devfile', () => {
    const data = createInitialDevfileData()
    data.attributes = 'controller.devfile.io/storage-type: ephemeral\nnested:\n  key: value'

    expect(buildDevfile(data).attributes).toEqual({
      'controller.devfile.io/storage-type': 'ephemeral',
      nested: { key: 'value' }
    })
  })

  test('invalid or non-map YAML is reported and not emitted', () => {
    expect(parseAttributes('key: [unterminated').error).toBeTruthy()
    expect(parseAttributes('- a list').error).toBe('Attributes must be a YAML map of key/value pairs')
    expect(parseAttributes('   ')).toEqual({ value: undefined, error: null })

    const data = createInitialDevfileData()
    data.attributes = '- a list'
    expect(buildDevfile(data).attributes).toBeUndefined()
  })
})

test.describe('YAML output', () => {
  test('the generated YAML parses back into the generated object', () => {
    const data = fullCoverageState()

    expect(yaml.load(generateYaml(data))).toEqual(buildDevfile(data))
  })

  test('keys keep the schema order and long lines are not wrapped', () => {
    const data = fullCoverageState()
    const lines = generateYaml(data).split('\n')

    expect(lines[0]).toBe('schemaVersion: 2.3.0')
    expect(lines[1]).toBe('metadata:')
    expect(lines.some((line) => line.endsWith('\\'))).toBe(false)
  })
})

test.describe('quantities', () => {
  const valid = [
    ['1Gi', 2 ** 30],
    ['512Mi', 512 * 2 ** 20],
    ['500m', 0.5],
    ['2', 2],
    ['1e3', 1000],
    ['1.5G', 1.5e9]
  ]

  for (const [value, expected] of valid) {
    test(`parses ${value}`, () => {
      expect(parseQuantity(value)).toBeCloseTo(expected, 5)
    })
  }

  for (const value of ['', 'abc', '1Gib', '1 Gi', 'Gi']) {
    test(`rejects ${JSON.stringify(value)}`, () => {
      expect(parseQuantity(value)).toBeNull()
    })
  }
})
