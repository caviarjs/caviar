const {Controller} = require('roe')

module.exports = class SayController extends Controller {
  hello () {
    this.ctx.body = 'hello'
  }
}
