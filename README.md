# ![caviar](logo/readme.png)

[![Build Status](https://travis-ci.org/caviarjs/caviar.svg?branch=master)](https://travis-ci.org/caviarjs/caviar)
[![Coverage](https://codecov.io/gh/caviarjs/caviar/branch/master/graph/badge.svg)](https://codecov.io/gh/caviarjs/caviar)

A pluggable and extendable skeleton which help to integrate several existing web frameworks to create your own micro frontends out of the box with even zero configuration.

`caviar` brings **web mesh** to the real world.

> An architectural style where independently deliverable frontend applications are composed into a greater whole

## Thinking in `caviar` about web mesh

> Why caviar?

****

> The sections below is for development purpose

## Extend `caviar` for your own business

### Config chain

## How to write caviar plugins

# API Documentation

## caviar(options).run(phase?)

```ts
await caviar(options: object).run(phase?: string): ChildProcess | void
```

- **phase?** `string='default'`

```js
const {
  caviar
} = require('caviar')

caviar({
  cwd: '/path/to/project',
  preset: '@my/caviar-preset'
})
.run()
.catch(console.error)
```

### options

**Common options**

- **cwd** `path` the current working directory
- **dev?** `boolean=false` whether is for development purpose
- **preset?** `string` module id or absolute path of the preset
- **configFile?** `path` absolute path of the configuration file. `options.configFile` often takes the return value of `require.resolve()`
- **sandbox?** `boolean=false` whether to enable caviar sandbox

**Sandbox options**

- **env?** `object` extra environment key-value pairs.
- **stdio?** `(Array | string)='inherit'` the `options.stdio` option of [`child_process.fork`](https://nodejs.org/dist/latest/docs/api/child_process.html#child_process_child_process_fork_modulepath_args_options)

### Return Value

## License

[MIT](LICENSE)

****

<p align="right">Thanks <a href="https://github.com/reallinfo">@reallinfo</a> for the great logo<p>

