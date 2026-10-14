import { expect, test } from '@playwright/test'
import yaml from 'js-yaml'
import { goToStep, readYaml } from './helpers'

/**
 * Rebuilds the Quarkus API example devfile through the wizard.
 *
 * Reference devfile:
 * https://github.com/che-incubator/quarkus-api-example/blob/main/devfile.yaml
 */
test.describe('Quarkus API example', () => {
  test('is reproduced through the wizard', async ({ page }) => {
    await page.goto('/')

    // Basics: the example uses generateName and a storage-type attribute.
    await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible()
    await page.fill('input[name="generateName"]', 'quarkus-api-example')
    await page.getByRole('button', { name: /Devfile attributes/ }).click()
    await page.fill('textarea[name="devfile-attributes"]', 'controller.devfile.io/storage-type: ephemeral')

    await goToStep(page, 'Components')

    // tools container
    await page.getByRole('button', { name: 'Add Component' }).click()
    const tools = page.getByTestId('component-0')
    await tools.locator('input[name="component-name-0"]').fill('tools')
    await tools.locator('input[name="component-image-0"]').fill(
      'quay.io/devfile/universal-developer-image:ubi9-latest'
    )
    await tools.locator('input[name="component-memoryRequest-0"]').fill('512Mi')
    await tools.locator('input[name="component-memoryLimit-0"]').fill('6G')
    await tools.locator('input[name="component-cpuRequest-0"]').fill('1000m')
    await tools.locator('input[name="component-cpuLimit-0"]').fill('4000m')

    await tools.getByRole('button', { name: /Environment variables/ }).click()
    await tools.getByRole('button', { name: 'Add Environment Variable' }).click()
    await tools.locator('input[name="component-env-0-name-0"]').fill('QUARKUS_HTTP_HOST')
    await tools.locator('input[name="component-env-0-value-0"]').fill('0.0.0.0')

    await tools.getByRole('button', { name: /^Endpoints/ }).click()
    await tools.getByRole('button', { name: 'Add Endpoint' }).click()
    await tools.locator('input[name="component-endpoint-0-name-0"]').fill('debug')
    await tools.locator('input[name="component-endpoint-0-targetPort-0"]').fill('5005')
    await tools.locator('select[name="component-endpoint-0-protocol-0"]').selectOption('tcp')
    await tools.locator('select[name="component-endpoint-0-exposure-0"]').selectOption('none')

    await tools.getByRole('button', { name: 'Add Endpoint' }).click()
    await tools.locator('input[name="component-endpoint-0-name-1"]').fill('list-all-food')
    await tools.locator('input[name="component-endpoint-0-targetPort-1"]').fill('8080')
    await tools.locator('select[name="component-endpoint-0-protocol-1"]').selectOption('https')
    await tools.locator('select[name="component-endpoint-0-exposure-1"]').selectOption('public')
    await tools.locator('input[name="component-endpoint-0-path-1"]').fill('/food')

    await tools.getByRole('button', { name: /Volume mounts/ }).click()
    await tools.getByRole('button', { name: 'Add Volume Mount' }).click()
    await tools.locator('input[name="component-volumeMount-0-name-0"]').fill('m2')
    await tools.locator('input[name="component-volumeMount-0-path-0"]').fill('/home/user/.m2')

    // postgresql container
    await page.getByRole('button', { name: 'Add Component' }).click()
    const postgres = page.getByTestId('component-1')
    await postgres.locator('input[name="component-name-1"]').fill('postgresql')
    await postgres.locator('input[name="component-image-1"]').fill(
      'quay.io/centos7/postgresql-13-centos7@sha256:994f5c622e2913bda1c4a7fa3b0c7e7f75e7caa3ac66ff1ed70ccfe65c40dd75'
    )
    await postgres.getByRole('button', { name: /Environment variables/ }).click()
    const postgresEnv = [
      ['POSTGRESQL_USER', 'user'],
      ['POSTGRESQL_PASSWORD', 'password'],
      ['POSTGRESQL_DATABASE', 'food_db'],
      ['PGDATA', '/tmp/pgdata']
    ]
    for (const [index, [name, value]] of postgresEnv.entries()) {
      await postgres.getByRole('button', { name: 'Add Environment Variable' }).click()
      await postgres.locator(`input[name="component-env-1-name-${index}"]`).fill(name)
      await postgres.locator(`input[name="component-env-1-value-${index}"]`).fill(value)
    }

    // m2 volume
    await page.getByRole('button', { name: 'Add Component' }).click()
    const m2 = page.getByTestId('component-2')
    await m2.locator('input[name="component-name-2"]').fill('m2')
    await m2.locator('select[name="component-type-2"]').selectOption('volume')
    await m2.locator('input[name="component-size-2"]').fill('1G')

    await goToStep(page, 'Commands')

    const execCommands = [
      {
        id: 'package',
        label: 'Package',
        commandLine: './mvnw clean package -DskipTests=true',
        group: 'build',
        isDefault: true
      },
      {
        id: 'startdev',
        label: 'Start Development mode (Hot reload + debug)',
        commandLine: './mvnw compile quarkus:dev',
        group: 'run',
        isDefault: true
      },
      { id: 'runtests', label: 'Run Tests', commandLine: './mvnw test', group: 'test', isDefault: false }
    ]

    for (const [index, command] of execCommands.entries()) {
      await page.getByRole('button', { name: 'Add Command' }).click()
      const item = page.getByTestId(`command-${index}`)
      await item.locator(`input[name="command-id-${index}"]`).fill(command.id)
      await item.locator(`input[name="command-component-${index}"]`).fill('tools')
      await item.locator(`input[name="command-commandLine-${index}"]`).fill(command.commandLine)
      await item
        .locator(`input[name="command-workingDir-${index}"]`)
        .fill('${PROJECTS_ROOT}/quarkus-api-example')
      await item.locator(`input[name="command-label-${index}"]`).fill(command.label)
      await item.locator(`select[name="command-group-kind-${index}"]`).selectOption(command.group)
      if (command.isDefault) {
        await item.locator(`input[name="command-group-isDefault-${index}"]`).check()
      }
    }

    await goToStep(page, 'Events')
    await page.locator('input[name="postStart-package"]').check()

    await goToStep(page, 'Review & Download')

    const devfile = await readYaml(page)

    expect(devfile).toEqual({
      schemaVersion: '2.3.0',
      metadata: { generateName: 'quarkus-api-example' },
      attributes: { 'controller.devfile.io/storage-type': 'ephemeral' },
      components: [
        {
          name: 'tools',
          container: {
            image: 'quay.io/devfile/universal-developer-image:ubi9-latest',
            env: [{ name: 'QUARKUS_HTTP_HOST', value: '0.0.0.0' }],
            volumeMounts: [{ name: 'm2', path: '/home/user/.m2' }],
            endpoints: [
              { name: 'debug', targetPort: 5005, exposure: 'none', protocol: 'tcp' },
              { name: 'list-all-food', targetPort: 8080, exposure: 'public', protocol: 'https', path: '/food' }
            ],
            memoryRequest: '512Mi',
            memoryLimit: '6G',
            cpuRequest: '1000m',
            cpuLimit: '4000m',
            mountSources: true
          }
        },
        {
          name: 'postgresql',
          container: {
            image:
              'quay.io/centos7/postgresql-13-centos7@sha256:994f5c622e2913bda1c4a7fa3b0c7e7f75e7caa3ac66ff1ed70ccfe65c40dd75',
            env: [
              { name: 'POSTGRESQL_USER', value: 'user' },
              { name: 'POSTGRESQL_PASSWORD', value: 'password' },
              { name: 'POSTGRESQL_DATABASE', value: 'food_db' },
              { name: 'PGDATA', value: '/tmp/pgdata' }
            ],
            mountSources: true
          }
        },
        { name: 'm2', volume: { size: '1G' } }
      ],
      commands: [
        {
          id: 'package',
          exec: {
            commandLine: './mvnw clean package -DskipTests=true',
            component: 'tools',
            workingDir: '${PROJECTS_ROOT}/quarkus-api-example',
            label: 'Package',
            group: { kind: 'build', isDefault: true }
          }
        },
        {
          id: 'startdev',
          exec: {
            commandLine: './mvnw compile quarkus:dev',
            component: 'tools',
            workingDir: '${PROJECTS_ROOT}/quarkus-api-example',
            label: 'Start Development mode (Hot reload + debug)',
            group: { kind: 'run', isDefault: true }
          }
        },
        {
          id: 'runtests',
          exec: {
            commandLine: './mvnw test',
            component: 'tools',
            workingDir: '${PROJECTS_ROOT}/quarkus-api-example',
            label: 'Run Tests',
            group: { kind: 'test' }
          }
        }
      ],
      events: { postStart: ['package'] }
    })

    await expect(page.getByText('Valid devfile')).toBeVisible()
  })

  test('downloads the generated devfile', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="name"]', 'quarkus-api-example')
    await goToStep(page, 'Review & Download')

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download devfile.yaml' }).click()
    ])

    expect(download.suggestedFilename()).toBe('quarkus-api-example-devfile.yaml')

    const stream = await download.createReadStream()
    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)

    expect(yaml.load(Buffer.concat(chunks).toString('utf8'))).toEqual({
      schemaVersion: '2.3.0',
      metadata: { name: 'quarkus-api-example' }
    })
  })
})
