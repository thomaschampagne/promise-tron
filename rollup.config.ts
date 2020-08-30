import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

const pkg = require('./package.json')

const libraryName = 'promise-tron'


/*export default {
  input: `src/${libraryName}.ts`,
  // output: {
  //   dir: 'output',
  //   name: libraryName,
  //   format: 'cjs'
  // },
  output: [
    {
      file: pkg.main, name: libraryName, format: 'umd', sourcemap: true
    },
    {
      file: pkg.module, format: 'es', sourcemap: true
    }
  ],
  plugins: [
    typescript({
      // tsconfig: './tsconfig.json',
      include: ['./src/!*.ts']
    }),
    commonjs({ extensions: ['ts'] })
  ]
}*/
// console.warn(pkg)

export default {
  input: `src/${libraryName}.ts`,
  output: [
    {
      /*file: pkg.main, */name: libraryName, format: 'umd', sourcemap: true, dir: 'dist/'
    },
    // {
    //   file: pkg.main, name: libraryName, format: 'umd', sourcemap: true
    // },
    // {
    //   file: pkg.module, format: 'es', sourcemap: true
    // }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['electron'],
  watch: {
    include: './src/*.ts'
  },
  plugins: [
    // Compile TypeScript files
    typescript({
      tsconfig: './tsconfig.json',
      // moduleResolution: 'Node',
      // target: 'esnext',
      // module: 'esnext',
      // lib: ['esnext', 'dom'],
      // strict: true,
      // // inlineSources: true,
      // sourceMap: true,
      // declarationMap: true,
      // // declaration: true,
      //
      // resolveJsonModule: true,
      // allowJs: true,
      // allowSyntheticDefaultImports: true,
      // // experimentalDecorators: true,
      // // emitDecoratorMetadata: true,
      // // declarationDir: '.',
      // // outDir: 'dist/lib',
      // typeRoots: [
      //   'node_modules/@types'
      // ],
      // declarationDir: './dist/lib/types',
      include: ['./src/*.ts']
    }),
    // Allow json resolution
    json(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    // commonjs(),
    commonjs({ extensions: ['.js', '.ts'] }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    // Resolve source maps to the original source
    sourceMaps()
  ]
}
