<p align="left"><img src="logo/horizontal.png" alt="caviar" height="120px"></p>

[![Build Status](https://travis-ci.org/kaelzhang/caviar.svg?branch=master)](https://travis-ci.org/kaelzhang/caviar)
[![Coverage](https://codecov.io/gh/kaelzhang/caviar/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/caviar)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/caviar?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/caviar)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/caviar.svg)](http://badge.fury.io/js/caviar)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/caviar.svg)](https://www.npmjs.org/package/caviar)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/caviar.svg)](https://david-dm.org/kaelzhang/caviar)
-->

# caviar

A pluggable and extendable web framework which integrates React, Next and Koa to create your own web application out of the box with even zero configuration.

## Getting Started

```sh
mkdir hello && cd hello
yo generator-caviar
npm run dev
```

Yeah, we have our first application

### File Structure

```
project/
|-- app
|-- pages
|-- caviar.config
|   |-- .env
|   |-- client.env
|   |-- index.js
|-- package.json
|-- ...
```

## Thinking in `caviar`


## Usage

```js
const {
  Sandbox,
  Server
} = require('caviar')
```

### new Sandbox(options)

- **options** `Object`
  - **cwd** `path` the current working directory
  - **port?** `number` server port
  - **dev?** `boolean=false` whether is for development purpose
  - **serverClassPath?** `path` the file path of the `Server` class. Defaults to the `Server` class path of the `caviar` project.

Creates a new sandbox. Sandbox is design to filter the environment variable.

#### await sandbox.start()

Start the sandbox, and it will create a new `Server` by passing `{cwd, port, dev}` as options.

### new Server(options)

- **options** `Object`
  - **cwd**
  - **port?** `Number` `options.port` will override `config.port` of `caviar.config.js`
  - **dev?**

Create a new `Server`

```js
const server = new Server({
  cwd,
  dev: true
})

await server.ready()
server.listen(8888)
```

#### await server.ready()

Initialize the server

#### server.listen(port?)

- **port?** `number` server port. If `port` is specified, it will override `options.port`.

This method must **NOT** be called after the server is ready (`await server.ready()`)

****

> The sections below is for development purpose

## Extend `caviar` for your own business



## How to write caviar plugins



## License

[MIT](LICENSE)
