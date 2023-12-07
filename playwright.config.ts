import { extendsConfig, branchPreview } from '@jill64/playwright-config'

export default extendsConfig(branchPreview(process.env.HOSTING_PROVIDER))
