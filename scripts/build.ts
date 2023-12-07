import esbuild from 'esbuild'

const build = (path: string) =>
  esbuild.build({
    entryPoints: [`src/${path}.ts`],
    outfile: `dist/${path}.js`,
    bundle: true,
    minify: true,
    format: 'esm',
    external: ['$app/*']
  })

build('index')
build('index-dev')
build('client/index')
build('client/index-dev')
build('server/index')
build('server/index-dev')
