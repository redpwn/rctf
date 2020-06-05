import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import Markdown from '../components/markdown'
import withStyles from '../components/jss'

export default withStyles({
  content: {
    '& a': {
      display: 'inline',
      padding: '0'
    },
    '& h1, & h2, & h3': {
      margin: '32px 0 16px 0'
    }
  }
}, class Home extends Component {
  componentDidMount () {
    document.title = config.ctfName
  }

  render ({ classes }) {
    return (
      <div class='row u-center'>
        <div class={`col-6 ${classes.content}`}>
          <Markdown content={config.homeContent} />
        </div>
      </div>
    )
  }
})
