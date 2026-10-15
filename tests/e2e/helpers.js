import { expect } from '@playwright/test'
import yaml from 'js-yaml'

/** Clicks through the wizard until the step with the given heading is shown. */
export async function goToStep(page, heading) {
  for (let step = 0; step < 10; step += 1) {
    const current = page.locator('.wizard-step h2')
    const text = await current.textContent()
    if (text === heading) return

    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(current).not.toHaveText(text)
  }

  throw new Error(`Step "${heading}" was never reached`)
}

/** Parses the devfile shown in the YAML preview. */
export async function readYaml(page) {
  const preview = page.getByTestId('yaml-preview').first()
  await expect(preview).toBeVisible()

  return yaml.load(await preview.textContent())
}
