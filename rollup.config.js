"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_typescript_1 = require("@rollup/plugin-typescript");
const plugin_commonjs_1 = require("@rollup/plugin-commonjs");
const rollup_plugin_sourcemaps_1 = require("rollup-plugin-sourcemaps");
const plugin_node_resolve_1 = require("@rollup/plugin-node-resolve");
const plugin_json_1 = require("@rollup/plugin-json");
const pkg = require('./package.json');
const libraryName = 'promise-tron';
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
exports.default = {
    input: `src/${libraryName}.ts`,
    output: [
        {
            /*file: pkg.main, */ name: libraryName, format: 'umd', sourcemap: true, dir: 'dist/'
        },
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: ['electron'],
    watch: {
        include: './src/*.ts'
    },
    plugins: [
        // Compile TypeScript files
        plugin_typescript_1.default({
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
        plugin_json_1.default(),
        // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        // commonjs(),
        plugin_commonjs_1.default({ extensions: ['.js', '.ts'] }),
        // Allow node_modules resolution, so you can use 'external' to control
        // which external modules to include in the bundle
        // https://github.com/rollup/rollup-plugin-node-resolve#usage
        plugin_node_resolve_1.default(),
        // Resolve source maps to the original source
        rollup_plugin_sourcemaps_1.default()
    ]
};
//# sourceMappingURL=rollup.config.js.map