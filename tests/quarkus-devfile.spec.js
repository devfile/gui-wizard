import { test, expect } from '@playwright/test'
import yaml from 'js-yaml'

/**
 * This test generates a simplified version of the Quarkus API example devfile
 * using the GUI wizard.
 *
 * Original devfile: https://github.com/che-incubator/quarkus-api-example/blob/main/devfile.yaml
 *
 * NOTE: This test uses 'name' instead of 'generateName' and doesn't include:
 * - Component env variables, endpoints, volumeMounts, memoryRequest, cpuRequest
 * - Command labels and groups (kind, isDefault)
 * - Root-level attributes
 *
 * These features will be added to the UI in future enhancements.
 */
test.describe('Quarkus API Example Devfile Generation', () => {
  test('should generate a basic Quarkus-like devfile through the wizard', async ({ page }) => {
    // Navigate to the wizard
    await page.goto('/')

    // Wait for the wizard to load
    await expect(page.locator('h2:has-text("Basic Information")')).toBeVisible()

    // Step 1: Metadata
    // NOTE: Using 'name' field since 'generateName' is not yet implemented in UI
    await page.fill('input[name="name"]', 'quarkus-api-example')

    // Navigate to next step
    await page.click('button:has-text("Next")')

    // Step 2: Projects - skip
    await expect(page.locator('h2:has-text("Projects")')).toBeVisible()
    await page.click('button:has-text("Next")')

    // Step 3: Components
    await expect(page.locator('h2:has-text("Components")')).toBeVisible()

    // Component 1: tools container
    await page.click('button:has-text("Add Component")')
    await page.fill('input[name="component-name-0"]', 'tools')
    await page.selectOption('select[name="component-type-0"]', 'container')
    await page.fill('input[name="component-image-0"]', 'quay.io/devfile/universal-developer-image:ubi9-latest')
    await page.fill('input[name="component-memoryLimit-0"]', '6G')
    await page.fill('input[name="component-cpuLimit-0"]', '4000m')

    // Component 2: postgresql container
    await page.click('button:has-text("Add Component")')
    await page.fill('input[name="component-name-1"]', 'postgresql')
    await page.selectOption('select[name="component-type-1"]', 'container')
    await page.fill('input[name="component-image-1"]', 'quay.io/centos7/postgresql-13-centos7@sha256:994f5c622e2913bda1c4a7fa3b0c7e7f75e7caa3ac66ff1ed70ccfe65c40dd75')

    // Component 3: m2 volume
    await page.click('button:has-text("Add Component")')
    await page.fill('input[name="component-name-2"]', 'm2')
    await page.selectOption('select[name="component-type-2"]', 'volume')
    // Wait for the volume size field to appear after type change
    await expect(page.locator('input[name="component-size-2"]')).toBeVisible()
    await page.fill('input[name="component-size-2"]', '1G')

    // Navigate to next step
    await page.click('button:has-text("Next")')

    // Step 4: Commands
    await expect(page.locator('h2:has-text("Commands")')).toBeVisible()

    // Command 1: package (build command)
    await page.click('button:has-text("Add Command")')
    await page.fill('input[name="command-id-0"]', 'package')
    await page.selectOption('select[name="command-type-0"]', 'exec')
    await page.selectOption('select[name="command-component-0"]', 'tools')
    await page.fill('input[name="command-commandLine-0"]', './mvnw clean package -DskipTests=true')
    await page.fill('input[name="command-workingDir-0"]', '${PROJECTS_ROOT}/quarkus-api-example')

    // Command 2: startdev (run command)
    await page.click('button:has-text("Add Command")')
    await page.fill('input[name="command-id-1"]', 'startdev')
    await page.selectOption('select[name="command-type-1"]', 'exec')
    await page.selectOption('select[name="command-component-1"]', 'tools')
    await page.fill('input[name="command-commandLine-1"]', './mvnw compile quarkus:dev')
    await page.fill('input[name="command-workingDir-1"]', '${PROJECTS_ROOT}/quarkus-api-example')

    // Navigate to next step
    await page.click('button:has-text("Next")')

    // Step 5: Events
    await expect(page.locator('h2:has-text("Events")')).toBeVisible()

    // Select package command for postStart event
    // Find all checkboxes labeled "package" and select the one under "Post Start" (index 1)
    await page.locator('label:has-text("package") input[type="checkbox"]').nth(1).check()

    // Navigate to next step
    await page.click('button:has-text("Next")')

    // Step 6: Variables - skip
    await expect(page.locator('h2:has-text("Variables")')).toBeVisible()
    await page.click('button:has-text("Next")')

    // Step 7: Review & Download
    await expect(page.locator('h2:has-text("Review & Download")')).toBeVisible()

    // Wait for YAML preview to be visible
    const yamlPreview = page.locator('pre, code').first()
    await expect(yamlPreview).toBeVisible()

    // Get the generated YAML content from the preview
    const yamlContent = await yamlPreview.textContent()

    // Parse the YAML
    const generatedDevfile = yaml.load(yamlContent)

    // Verify basic structure
    expect(generatedDevfile.schemaVersion).toBe('2.3.0')
    expect(generatedDevfile.metadata.name).toBe('quarkus-api-example')

    // Verify components
    expect(generatedDevfile.components.length).toBeGreaterThanOrEqual(3)

    const toolsComponent = generatedDevfile.components.find(c => c.name === 'tools')
    expect(toolsComponent).toBeDefined()
    expect(toolsComponent.container).toBeDefined()
    expect(toolsComponent.container.image).toBe('quay.io/devfile/universal-developer-image:ubi9-latest')
    expect(toolsComponent.container.memoryLimit).toBe('6G')
    expect(toolsComponent.container.cpuLimit).toBe('4000m')

    const postgresComponent = generatedDevfile.components.find(c => c.name === 'postgresql')
    expect(postgresComponent).toBeDefined()
    expect(postgresComponent.container).toBeDefined()
    expect(postgresComponent.container.image).toContain('postgresql-13-centos7')

    const m2Component = generatedDevfile.components.find(c => c.name === 'm2')
    expect(m2Component).toBeDefined()
    expect(m2Component.volume).toBeDefined()
    expect(m2Component.volume.size).toBe('1G')

    // Verify commands
    expect(generatedDevfile.commands.length).toBeGreaterThanOrEqual(2)

    const packageCmd = generatedDevfile.commands.find(c => c.id === 'package')
    expect(packageCmd).toBeDefined()
    expect(packageCmd.exec).toBeDefined()
    expect(packageCmd.exec.component).toBe('tools')
    expect(packageCmd.exec.commandLine).toContain('./mvnw clean package')
    expect(packageCmd.exec.workingDir).toBe('${PROJECTS_ROOT}/quarkus-api-example')

    const startdevCmd = generatedDevfile.commands.find(c => c.id === 'startdev')
    expect(startdevCmd).toBeDefined()
    expect(startdevCmd.exec).toBeDefined()
    expect(startdevCmd.exec.commandLine).toContain('quarkus:dev')

    // Verify events
    expect(generatedDevfile.events).toBeDefined()
    expect(generatedDevfile.events.postStart).toBeDefined()
    expect(generatedDevfile.events.postStart).toContain('package')

    // Verify schema compliance: no 'type' field in components
    generatedDevfile.components.forEach(component => {
      expect(component.type).toBeUndefined()
    })

    // Verify schema compliance: no 'kind' field in commands
    generatedDevfile.commands.forEach(command => {
      expect(command.kind).toBeUndefined()
    })

    console.log('✅ Quarkus-like devfile generated successfully!')
    console.log('\nGenerated YAML:')
    console.log(yamlContent)
  })

  test('should verify devfile schema 2.3.0 compliance', async ({ page }) => {
    // This test verifies that the generated devfile is compliant with schema 2.3.0
    await page.goto('/')

    // Fill minimal data
    await page.fill('input[name="name"]', 'test-devfile')
    await page.click('button:has-text("Next")') // Skip projects
    await page.click('button:has-text("Next")') // Skip components
    await page.click('button:has-text("Next")') // Skip commands
    await page.click('button:has-text("Next")') // Skip events
    await page.click('button:has-text("Next")') // Skip variables
    await page.click('button:has-text("Next")') // Go to review

    // Get generated YAML
    const yamlPreview = page.locator('pre, code').first()
    await expect(yamlPreview).toBeVisible()
    const yamlContent = await yamlPreview.textContent()
    const devfile = yaml.load(yamlContent)

    // Verify required fields
    expect(devfile.schemaVersion).toBe('2.3.0')
    expect(devfile.metadata).toBeDefined()
    expect(devfile.metadata.name).toBe('test-devfile')

    // Verify that type/kind fields are not present
    if (devfile.components) {
      devfile.components.forEach(component => {
        expect(component.type).toBeUndefined()
      })
    }

    if (devfile.commands) {
      devfile.commands.forEach(command => {
        expect(command.kind).toBeUndefined()
      })
    }
  })
})
