/**
 * Wizard states used by the unit tests.
 *
 * `fullCoverageStates` together exercise every field of the devfile 2.3.0
 * schema; `tests/unit/schema-coverage.spec.js` asserts that nothing is left
 * out. They are written in the shape the wizard keeps in memory (maps as
 * ordered key/value arrays, attributes as raw YAML text), which is what
 * `buildDevfile` consumes.
 */

export function endpoint(name, targetPort, overrides = {}) {
  return {
    name,
    targetPort,
    exposure: 'public',
    protocol: 'https',
    path: '/api',
    secure: true,
    annotation: [{ key: 'haproxy.router.openshift.io/balance', value: 'roundrobin' }],
    attributes: 'discoverable: true',
    ...overrides
  }
}

export function container(overrides = {}) {
  return {
    image: 'quay.io/devfile/universal-developer-image:ubi9-latest',
    command: ['sleep'],
    args: ['infinity'],
    env: [{ name: 'MAVEN_OPTS', value: '-Xmx1g' }],
    volumeMounts: [{ name: 'm2', path: '/home/user/.m2' }],
    endpoints: [endpoint('http-8080', 8080)],
    memoryRequest: '512Mi',
    memoryLimit: '2Gi',
    cpuRequest: '100m',
    cpuLimit: '1000m',
    mountSources: true,
    sourceMapping: '/projects',
    dedicatedPod: false,
    annotation: {
      deployment: [{ key: 'app.kubernetes.io/part-of', value: 'workspace' }],
      service: [{ key: 'service.beta.openshift.io/serving-cert-secret-name', value: 'tls' }]
    },
    ...overrides
  }
}

export function gitSource(overrides = {}) {
  return {
    remotes: [
      { key: 'origin', value: 'https://github.com/devfile/gui-wizard.git' },
      { key: 'fork', value: 'https://github.com/ibuziuk/gui-wizard.git' }
    ],
    checkoutFrom: { remote: 'origin', revision: 'main' },
    ...overrides
  }
}

/** Components covering the five component types and the three dockerfile sources. */
export function components({ partial = false } = {}) {
  return [
    {
      name: 'tools',
      attributes: 'controller.devfile.io/merge-contribution: true',
      container: container()
    },
    {
      name: 'isolated',
      attributes: '',
      container: container({
        image: 'quay.io/centos7/postgresql-13-centos7:latest',
        command: [],
        args: [],
        env: [],
        volumeMounts: [],
        endpoints: [endpoint('db-5432', 5432)],
        dedicatedPod: true,
        annotation: { deployment: [], service: [] }
      })
    },
    {
      name: 'm2',
      attributes: '',
      volume: { size: '1Gi', ephemeral: true }
    },
    {
      name: 'k8s-resource',
      attributes: '',
      kubernetes: {
        uri: 'manifests/deployment.yaml',
        inlined: null,
        deployByDefault: true,
        endpoints: [endpoint('k8s-9090', 9090)]
      }
    },
    {
      name: 'ocp-resource',
      attributes: '',
      openshift: {
        uri: null,
        inlined: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: my-service\n',
        deployByDefault: false,
        endpoints: [endpoint('ocp-9091', 9091)]
      }
    },
    {
      name: 'k8s-inlined',
      attributes: '',
      kubernetes: {
        uri: null,
        inlined: 'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: my-config\n',
        deployByDefault: false,
        endpoints: []
      }
    },
    {
      name: 'ocp-uri',
      attributes: '',
      openshift: {
        uri: 'manifests/route.yaml',
        inlined: null,
        deployByDefault: true,
        endpoints: []
      }
    },
    {
      name: 'image-uri',
      attributes: '',
      image: {
        imageName: 'quay.io/my-org/my-app:latest',
        autoBuild: partial ? undefined : true,
        dockerfile: {
          uri: 'docker/Dockerfile',
          devfileRegistry: null,
          git: null,
          buildContext: '.',
          rootRequired: true,
          args: ['--build-arg=VERSION=1.0']
        }
      }
    },
    {
      name: 'image-registry',
      attributes: '',
      image: {
        imageName: 'quay.io/my-org/from-registry:latest',
        autoBuild: undefined,
        dockerfile: {
          uri: null,
          devfileRegistry: { id: 'nodejs', registryUrl: 'https://registry.devfile.io' },
          git: null,
          buildContext: 'build',
          rootRequired: false,
          args: []
        }
      }
    },
    {
      name: 'image-git',
      attributes: '',
      image: {
        imageName: 'quay.io/my-org/from-git:latest',
        autoBuild: undefined,
        dockerfile: {
          uri: null,
          devfileRegistry: null,
          git: {
            remotes: [{ key: 'origin', value: 'https://github.com/devfile/gui-wizard.git' }],
            checkoutFrom: { remote: 'origin', revision: 'main' },
            fileLocation: 'docker/Dockerfile'
          },
          buildContext: 'build',
          rootRequired: false,
          args: []
        }
      }
    }
  ]
}

/** Commands covering the three command types, groups, labels and env. */
export function commands({ partial = false } = {}) {
  return [
    {
      id: 'build',
      attributes: 'controller.devfile.io/imported-by: parent',
      exec: {
        component: 'tools',
        commandLine: './mvnw clean package',
        workingDir: '${PROJECT_SOURCE}',
        env: [{ name: 'MAVEN_ARGS', value: '-DskipTests' }],
        label: 'Build the application',
        group: { kind: 'build', isDefault: true },
        hotReloadCapable: true
      }
    },
    {
      id: 'start',
      attributes: '',
      exec: {
        component: 'tools',
        commandLine: './mvnw quarkus:dev',
        workingDir: '',
        env: [],
        label: 'Start in dev mode',
        group: { kind: 'run', isDefault: true },
        hotReloadCapable: partial ? undefined : false
      }
    },
    {
      id: 'deploy-k8s',
      attributes: '',
      apply: {
        component: 'k8s-resource',
        label: 'Deploy the manifests',
        group: { kind: 'deploy', isDefault: true }
      }
    },
    {
      id: 'build-image',
      attributes: '',
      apply: {
        component: 'image-uri',
        label: 'Build the container image',
        group: { kind: '', isDefault: partial ? undefined : false }
      }
    },
    {
      id: 'build-and-start',
      attributes: '',
      composite: {
        commands: ['build', 'start'],
        parallel: true,
        label: 'Build then start',
        group: { kind: 'test', isDefault: true }
      }
    }
  ]
}

export function projects(kind) {
  const starter = kind === 'starterProjects'

  const base = {
    name: `${starter ? 'starter' : 'main'}-git`,
    attributes: 'app.kubernetes.io/name: sample',
    git: starter ? gitSource({ remotes: [{ key: 'origin', value: 'https://github.com/devfile/api.git' }] }) : gitSource(),
    zip: null
  }

  const archive = {
    name: `${starter ? 'starter' : 'main'}-zip`,
    attributes: '',
    git: null,
    zip: { location: 'https://example.com/archive.zip' }
  }

  if (starter) {
    base.description = 'A sample starter project'
    base.subDir = 'examples/rest-api'
    archive.description = 'A zipped starter project'
    archive.subDir = ''
  } else {
    base.clonePath = 'sample'
    archive.clonePath = 'archive'
  }

  return [base, archive]
}

export function parentOverrides() {
  return {
    variables: [{ key: 'PARENT_VERSION', value: '2.0.0' }],
    attributes: 'controller.devfile.io/storage-type: ephemeral',
    components: [
      ...components({ partial: true }),
      {
        name: 'image-auto',
        attributes: '',
        image: { imageName: 'quay.io/my-org/inherited:latest', autoBuild: true, dockerfile: null }
      }
    ],
    commands: commands({ partial: true }),
    projects: projects('projects'),
    starterProjects: projects('starterProjects'),
    dependentProjects: projects('dependentProjects')
  }
}

function baseState() {
  return {
    schemaVersion: '2.3.0',
    metadata: {
      name: 'full-coverage',
      generateName: '',
      version: '1.2.3',
      displayName: 'Full coverage stack',
      description: 'A devfile exercising every field of the 2.3.0 schema',
      icon: 'https://example.com/icon.png',
      language: 'Java',
      projectType: 'quarkus',
      provider: 'Devfile community',
      tags: ['Java', 'Quarkus'],
      architectures: ['amd64', 'arm64'],
      website: 'https://devfile.io',
      supportUrl: 'https://devfile.io/docs',
      globalMemoryLimit: '2674Mi',
      attributes: 'alpha.build-context: .'
    },
    attributes: 'controller.devfile.io/devworkspace-config:\n  name: config\n  namespace: devfile',
    parent: null,
    projects: projects('projects'),
    starterProjects: projects('starterProjects'),
    dependentProjects: projects('dependentProjects'),
    components: components(),
    commands: commands(),
    events: {
      preStart: ['deploy-k8s'],
      postStart: ['build-and-start'],
      preStop: ['start'],
      postStop: ['build-image']
    },
    variables: [{ key: 'VERSION', value: '1.0.0' }]
  }
}

/** Everything the schema allows, with a parent referenced by uri. */
export function fullCoverageState() {
  return {
    ...baseState(),
    parent: {
      uri: 'https://registry.devfile.io/devfiles/java-quarkus',
      id: null,
      kubernetes: null,
      registryUrl: '',
      version: '',
      ...parentOverrides()
    }
  }
}

/** Same devfile, but inheriting from a registry stack. */
export function parentByIdState() {
  return {
    ...baseState(),
    parent: {
      uri: null,
      id: 'java-quarkus',
      kubernetes: null,
      registryUrl: 'https://registry.devfile.io',
      version: '1.2.0',
      ...parentOverrides()
    }
  }
}

/** Same devfile, but inheriting from a DevWorkspaceTemplate. */
export function parentByKubernetesState() {
  return {
    ...baseState(),
    parent: {
      uri: null,
      id: null,
      kubernetes: { name: 'my-template', namespace: 'my-namespace' },
      registryUrl: '',
      version: '',
      ...parentOverrides()
    }
  }
}

export function fullCoverageStates() {
  return [fullCoverageState(), parentByIdState(), parentByKubernetesState()]
}
