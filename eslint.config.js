import { tsConfig } from '@jill64/eslint-config-ts'

/** @type {import('@jill64/eslint-config-svelte').FlatConfig[]} */
export default [
  ...tsConfig(),
  {
    ignores: ['tests', 'demo', 'scripts', 'src/sentry-javascript']
  }
]
