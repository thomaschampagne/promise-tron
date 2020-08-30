import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

const pkg = require('./package.json')

const libraryName = 'promise-tron'

console.warn(pkg)

export default {
  input: `src/${libraryName}.ts`,
  output: [
    {
      file: pkg.main, name: libraryName, format: 'umd', sourcemap: true
    },
    {
      file: pkg.module, format: 'es', sourcemap: true
    }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['electron'],
  watch: {
    include: './src/*.ts',
  },
  plugins: [
    // Compile TypeScript files
    typescript({
      tsconfig: './tsconfig.json',
      include: ['./src/*.ts']
    }),
    // Allow json resolution
    json(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    // Resolve source maps to the original source
    sourceMaps()
  ]
}
