import { expect, test } from '@playwright/test'

test('SSG', async ({ page }) => {
  await page.goto('/ssg')
  await expect(page.getByRole('heading', { name: 'SSG' })).toBeVisible()

  await page.getByRole('link', { name: 'Goto Root' }).click()

  await expect(
    page.getByRole('heading', { name: 'sentry-sveltekit-edge' })
  ).toBeVisible()
})
