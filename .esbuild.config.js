const esbuild = require('esbuild')
const sassPlugin = require('esbuild-sass-plugin').sassPlugin

const watch = process.argv.includes('--watch')
// const minify = !watch

const replaceNodeBuiltIns = () => {
  const replace = {
    path: require.resolve('path-browserify'),
  }
  const filter = RegExp(`^(${Object.keys(replace).join('|')})$`)
  return {
    name: 'replaceNodeBuiltIns',
    setup(build) {
      build.onResolve({ filter }, (arg) => ({
        path: replace[arg.path],
      }))
    },
  }
}

esbuild
  .build({
    entryPoints: ['src/extension.ts'],
    tsconfig: './tsconfig.json',
    bundle: true,
    minify: true,
    external: ['vscode'],
    sourcemap: 'inline',
    platform: 'node',
    outfile: 'out/extension.js',
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    entryPoints: ['media/editor/index.ts'],
    tsconfig: './tsconfig.json',
    bundle: true,
    external: ['vscode'],
    minify: true,
    sourcemap: 'inline',
    plugins: [replaceNodeBuiltIns()],
    mainFields: ['browser', 'module', 'main'],
    platform: 'browser',
    outfile: 'out/editor.js',
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    entryPoints: ['media/editor/style.scss'],
    bundle: true,
    minify: true,
    plugins: [sassPlugin()],
    outfile: 'out/editor.css',
  })
  .catch(() => process.exit(1))
