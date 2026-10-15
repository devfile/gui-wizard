import { expect, test } from '@playwright/test'
import { goToStep, readYaml } from './helpers'

/** Exercises the sections the Quarkus example does not use. */
test.describe('full schema coverage through the UI', () => {
  test('parent, projects, every component and command type, and variables', async ({ page }) => {
    await page.goto('/')

    await page.fill('input[name="name"]', 'full-coverage')
    await page.fill('input[name="version"]', '1.0.0')
    await page.fill('input[name="language"]', 'Java')
    await page.getByRole('button', { name: 'Add Tag' }).click()
    await page.fill('input[name="metadata-tags-0"]', 'Quarkus')
    await page.check('input[name="metadata-architectures-amd64"]')

    // Parent
    await goToStep(page, 'Parent')
    await page.getByRole('button', { name: 'Add Parent' }).click()
    await page.selectOption('select[name="parent-source"]', 'id')
    await page.fill('input[name="parent-id"]', 'java-quarkus')
    await page.fill('input[name="parent-registryUrl"]', 'https://registry.devfile.io')
    await page.fill('input[name="parent-version"]', 'latest')

    // Projects, starter projects and dependent projects
    await goToStep(page, 'Projects')
    // The "Projects" section is the one open by default.
    await page.getByRole('button', { name: 'Add Project' }).click()
    await page.fill('input[name="project-name-0"]', 'sample')
    await page.fill('input[name="project-clonePath-0"]', 'sample')
    await page.fill('input[name="project-git-0-remotes-value-0"]', 'https://github.com/devfile/api.git')
    await page.fill('input[name="project-git-0-checkoutFrom-revision"]', 'main')

    await page.getByRole('button', { name: /Starter Projects/ }).click()
    await page.getByRole('button', { name: 'Add Starter Project' }).click()
    await page.fill('input[name="starter-project-name-0"]', 'starter')
    await page.fill('input[name="starter-project-description-0"]', 'A starter project')
    await page.selectOption('select[name="starter-project-source-0"]', 'zip')
    await page.fill('input[name="starter-project-zip-location-0"]', 'https://example.com/starter.zip')

    await page.getByRole('button', { name: /Dependent Projects/ }).click()
    await page.getByRole('button', { name: 'Add Dependent Project' }).click()
    await page.fill('input[name="dependent-project-name-0"]', 'library')
    await page.fill('input[name="dependent-project-git-0-remotes-value-0"]', 'https://github.com/devfile/library.git')

    // Components: container, volume, kubernetes, openshift and image
    await goToStep(page, 'Components')

    await page.getByRole('button', { name: 'Add Component' }).click()
    await page.fill('input[name="component-name-0"]', 'tools')
    await page.fill('input[name="component-image-0"]', 'quay.io/devfile/universal-developer-image:ubi9-latest')

    await page.getByRole('button', { name: 'Add Component' }).click()
    await page.fill('input[name="component-name-1"]', 'storage')
    await page.selectOption('select[name="component-type-1"]', 'volume')
    await page.fill('input[name="component-size-1"]', '2Gi')
    await page.check('input[name="component-ephemeral-1"]')

    await page.getByRole('button', { name: 'Add Component' }).click()
    await page.fill('input[name="component-name-2"]', 'k8s-resource')
    await page.selectOption('select[name="component-type-2"]', 'kubernetes')
    await page.fill('input[name="component-kubernetes-uri-2"]', 'manifests/deployment.yaml')
    await page.selectOption('select[name="component-kubernetes-deployByDefault-2"]', 'true')

    await page.getByRole('button', { name: 'Add Component' }).click()
    await page.fill('input[name="component-name-3"]', 'ocp-resource')
    await page.selectOption('select[name="component-type-3"]', 'openshift')
    await page.selectOption('select[name="component-openshift-source-3"]', 'inlined')
    await page.fill(
      'textarea[name="component-openshift-inlined-3"]',
      'apiVersion: v1\nkind: Service\nmetadata:\n  name: my-service'
    )

    await page.getByRole('button', { name: 'Add Component' }).click()
    await page.fill('input[name="component-name-4"]', 'app-image')
    await page.selectOption('select[name="component-type-4"]', 'image')
    await page.fill('input[name="component-imageName-4"]', 'quay.io/my-org/my-app:latest')
    await page.fill('input[name="component-dockerfile-uri-4"]', 'docker/Dockerfile')
    await page.fill('input[name="component-dockerfile-buildContext-4"]', '.')

    // Commands: exec, apply and composite
    await goToStep(page, 'Commands')

    await page.getByRole('button', { name: 'Add Command' }).click()
    await page.fill('input[name="command-id-0"]', 'build')
    await page.fill('input[name="command-component-0"]', 'tools')
    await page.fill('input[name="command-commandLine-0"]', './mvnw package')

    await page.getByRole('button', { name: 'Add Command' }).click()
    await page.fill('input[name="command-id-1"]', 'deploy')
    await page.selectOption('select[name="command-type-1"]', 'apply')
    await page.fill('input[name="command-component-1"]', 'k8s-resource')

    await page.getByRole('button', { name: 'Add Command' }).click()
    await page.fill('input[name="command-id-2"]', 'build-and-deploy')
    await page.selectOption('select[name="command-type-2"]', 'composite')
    await page.getByRole('button', { name: 'Add Sub-command' }).click()
    await page.fill('input[name="command-subcommand-2-0"]', 'build')

    // Events
    await goToStep(page, 'Events')
    await page.check('input[name="preStart-deploy"]')

    // Variables
    await goToStep(page, 'Variables')
    await page.getByRole('button', { name: 'Add Variable' }).click()
    await page.fill('input[name="variable-key-0"]', 'VERSION')
    await page.fill('input[name="variable-value-0"]', '1.0.0')

    await goToStep(page, 'Review & Download')

    const devfile = await readYaml(page)

    expect(devfile.metadata).toEqual({
      name: 'full-coverage',
      version: '1.0.0',
      language: 'Java',
      tags: ['Quarkus'],
      architectures: ['amd64']
    })
    expect(devfile.parent).toEqual({
      id: 'java-quarkus',
      registryUrl: 'https://registry.devfile.io',
      version: 'latest'
    })
    expect(devfile.projects).toEqual([
      {
        name: 'sample',
        clonePath: 'sample',
        git: {
          remotes: { origin: 'https://github.com/devfile/api.git' },
          checkoutFrom: { revision: 'main' }
        }
      }
    ])
    expect(devfile.starterProjects).toEqual([
      { name: 'starter', description: 'A starter project', zip: { location: 'https://example.com/starter.zip' } }
    ])
    expect(devfile.dependentProjects).toEqual([
      { name: 'library', git: { remotes: { origin: 'https://github.com/devfile/library.git' } } }
    ])
    expect(devfile.components.map((component) => Object.keys(component).at(-1))).toEqual([
      'container',
      'volume',
      'kubernetes',
      'openshift',
      'image'
    ])
    expect(devfile.components[1].volume).toEqual({ size: '2Gi', ephemeral: true })
    expect(devfile.components[2].kubernetes).toEqual({
      uri: 'manifests/deployment.yaml',
      deployByDefault: true
    })
    expect(devfile.components[3].openshift.inlined).toContain('kind: Service')
    expect(devfile.components[4].image).toEqual({
      imageName: 'quay.io/my-org/my-app:latest',
      dockerfile: { uri: 'docker/Dockerfile', buildContext: '.' }
    })
    expect(devfile.commands.map((command) => Object.keys(command).at(-1))).toEqual([
      'exec',
      'apply',
      'composite'
    ])
    expect(devfile.commands[2].composite).toEqual({ commands: ['build'] })
    expect(devfile.events).toEqual({ preStart: ['deploy'] })
    expect(devfile.variables).toEqual({ VERSION: '1.0.0' })

    await expect(page.getByText('Valid devfile')).toBeVisible()
  })

  test('a parent can be removed again', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="name"]', 'sample')

    await goToStep(page, 'Parent')
    await page.getByRole('button', { name: 'Add Parent' }).click()
    await page.fill('input[name="parent-uri"]', 'https://example.com/devfile.yaml')
    expect((await readYaml(page)).parent).toEqual({ uri: 'https://example.com/devfile.yaml' })

    await page.getByRole('button', { name: 'Remove Parent' }).click()
    await expect(page.getByRole('button', { name: 'Add Parent' })).toBeVisible()
    expect((await readYaml(page)).parent).toBeUndefined()
  })
})

test.describe('validation', () => {
  test('errors are reported on the step and block the download', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="name"]', 'sample')

    await goToStep(page, 'Components')
    await page.getByRole('button', { name: 'Add Component' }).click()

    const errors = page.getByTestId('step-errors')
    await expect(errors).toContainText('name is required')
    await expect(errors).toContainText('container image is required')

    await goToStep(page, 'Review & Download')
    await expect(page.getByRole('button', { name: 'Download devfile.yaml' })).toBeDisabled()

    await page.getByRole('button', { name: 'Edit' }).nth(3).click()
    await page.fill('input[name="component-name-0"]', 'tools')
    await page.fill('input[name="component-image-0"]', 'quay.io/devfile/base-developer-image:ubi10-latest')

    await goToStep(page, 'Review & Download')
    await expect(page.getByRole('button', { name: 'Download devfile.yaml' })).toBeEnabled()
  })

  test('warnings do not block the download', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="name"]', 'sample')

    await goToStep(page, 'Projects')
    await page.getByRole('button', { name: 'Add Project' }).click()
    await page.fill('input[name="project-name-0"]', 'sample')
    await page.selectOption('select[name="project-source-0"]', 'zip')

    await expect(page.getByTestId('step-warnings')).toContainText('zip source has no location')

    await goToStep(page, 'Review & Download')
    await expect(page.getByTestId('review-warnings')).toContainText('zip source has no location')
    await expect(page.getByRole('button', { name: 'Download devfile.yaml' })).toBeEnabled()
  })

  test('a map entry that would be dropped is reported on its step', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="name"]', 'sample')

    await goToStep(page, 'Variables')
    await page.getByRole('button', { name: 'Add Variable' }).click()
    await page.fill('input[name="variable-value-0"]', '1.0.0')

    const errors = page.getByTestId('step-errors')
    await expect(errors).toContainText('a variable has a value but no name')

    await page.fill('input[name="variable-key-0"]', 'VERSION')
    await expect(errors).toBeHidden()
    expect((await readYaml(page)).variables).toEqual({ VERSION: '1.0.0' })

    await page.getByRole('button', { name: 'Add Variable' }).click()
    await page.fill('input[name="variable-key-1"]', 'VERSION')
    await expect(errors).toContainText('duplicate variable "VERSION"')
  })

  test('the wizard can be reset', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="name"]', 'sample')
    await goToStep(page, 'Review & Download')

    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Reset Wizard' }).click()

    await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible()
    await expect(page.locator('input[name="name"]')).toHaveValue('')
  })
})

test.describe('reordering a list', () => {
  const envSection = (page, testId) =>
    page.getByTestId(testId).getByRole('button', { name: /Environment variables/ })

  test('an expanded section follows its component', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="name"]', 'sample')

    await goToStep(page, 'Components')
    await page.getByRole('button', { name: 'Add Component' }).click()
    await page.fill('input[name="component-name-0"]', 'first')
    await page.getByRole('button', { name: 'Add Component' }).click()
    await page.fill('input[name="component-name-1"]', 'second')

    await envSection(page, 'component-1').click()
    await expect(envSection(page, 'component-1')).toHaveAttribute('aria-expanded', 'true')

    await page.getByTestId('component-1').getByTitle('Move up').click()

    await expect(page.locator('input[name="component-name-0"]')).toHaveValue('second')
    await expect(envSection(page, 'component-0')).toHaveAttribute('aria-expanded', 'true')
    await expect(envSection(page, 'component-1')).toHaveAttribute('aria-expanded', 'false')
  })
})
