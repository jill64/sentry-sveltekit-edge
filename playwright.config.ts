import { extendsConfig } from '@jill64/playwright-config'

const { CI, PREVIEW_HOST } = process.env

export default extendsConfig({
  use: CI
    ? {
        baseURL: `https://${PREVIEW_HOST}`
      }
    : undefined,
  webServer: CI
    ? undefined
    : {
        command: 'pnpm run preview',
        port: 4173
      }
})
