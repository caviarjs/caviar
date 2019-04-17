const path = require('path')
const defineRouter = require('roe-define-router')

module.exports = defineRouter({
  // Server APIs
  routes: {
    '/say/hello': 'say.hello'
  },

  // Next pages
  pages: {
    // Which can be configured in short:
    // '/:lang': 'index'
    '/:lang': 'index'
  },

  // Static files to be served
  static: {
    '/static': 'static'
  }

// Extra things to do with egg app
}, {
  static: {
    root: path.join(__dirname, '..')
  }
})
