import { Component } from 'react'

class App extends Component {
  render() {
    return (
      <div>
        <div>{this.props.lang}</div>
        <div>{process.env.HELLO_WORLD}</div>
      </div>
    )
  }
}

export default class IndexPage extends Component {
  static getInitialProps ({query}) {
    const {
      lang = 'default'
    } = query

    return {
      lang
    }
  }

  render () {
    return (
      <App lang={this.props.lang}/>
    )
  }
}
