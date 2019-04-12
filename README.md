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

The web framework which integrates React, Next and Koa

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

## For Developers

```js
const {
  Server,
  Sandbox
} = require('caviar')
```

### Server

### Sandbox

## License

MIT
