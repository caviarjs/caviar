const {
  Errors
} = require('err-object')

const {E, error} = new Errors()

E('DUPLICATE_ENV_KEY', 'env "%s" defined in both server.env and client.env')

E('NOT_IMPLEMENT', 'method "%s" must be implemented')

module.exports = error
