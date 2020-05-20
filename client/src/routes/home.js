import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import Sponsors from '../components/sponsors'
import Markdown from '../components/markdown'
import withStyles from '../components/jss'

export default withStyles({
  row: {
    marginBottom: '3.125em'
  },
  logo: {
    height: '9.375em !important',
    width: '9.375em !important'
  },
  content: {
    '& a': {
      display: 'inline',
      padding: '0'
    },
    '& h3': {
      margin: '32px 0 16px 0'
    },
    '& img': {
      width: '300px',
      margin: '20px auto',
      display: 'block'
    }
  }
}, class Home extends Component {
  componentDidMount () {
    document.title = config.ctfName
  }

  render ({ classes }) {
    return (
      <div>
        <div class='row u-center'>
          <div class={`col-6 ${classes.content}`}>
            <Markdown content={config.homeContent} />
          </div>
        </div>
        <Sponsors />
      </div>
    )
  }
})
