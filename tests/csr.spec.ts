import { expect, test } from '@playwright/test'

test('CSR', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'sentry-sveltekit-edge' })
  ).toBeVisible()

  await page.goto('/csr')

  await expect(page.getByRole('heading', { name: 'CSR' })).toBeVisible()
})

test('CSR Throw', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'sentry-sveltekit-edge' })
  ).toBeVisible()

  await page.goto('/throw/layout/load')

  await expect(page.getByRole('heading', { name: 'Error Page' })).toBeVisible()
  await expect(page.getByText('EventId: undefined')).not.toBeVisible()
})
