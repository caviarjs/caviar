# ![caviar](logo/readme.png)

[![Build Status](https://travis-ci.org/caviarjs/caviar.svg?branch=master)](https://travis-ci.org/caviarjs/caviar)
[![Coverage](https://codecov.io/gh/caviarjs/caviar/branch/master/graph/badge.svg)](https://codecov.io/gh/caviarjs/caviar)

A pluggable and extendable skeleton which help to integrate several existing web frameworks to create your own micro frontends out of the box with even zero configuration.

> An architectural style where independently deliverable frontend applications are composed into a greater whole

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

****

> The sections below is for development purpose

## Extend `caviar` for your own business

### Config chain

## How to write caviar plugins

## API Documentation

### caviar(options: object)

```js
const {
  caviar
} = require('caviar')


```

**Common options**

- **cwd** `path` the current working directory
- **dev?** `boolean=false` whether is for development purpose
- **preset?** `string`
- **configFile?** `path`
- **sandbox?** `boolean=false` whether to enable caviar sandbox

Creates a new sandbox. Sandbox is design to filter the environment variables.

## License

[MIT](LICENSE)

****

<p align="right">Thanks <a href="https://github.com/reallinfo">@reallinfo</a> for the great logo<p>

