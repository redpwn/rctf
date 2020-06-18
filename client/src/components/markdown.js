import snarkdown from 'snarkdown'
import Markup from 'preact-markup'
import withStyles from './jss'
import Timer from './timer'
import Sponsors from './sponsors'
import ActionButton from './action-button'

const Markdown = withStyles({
  root: {
    '& pre.code': {
      padding: '10px',
      background: 'var(--cirrus-code-bg)',
      borderRadius: '5px',
      margin: '10px 0',
      color: '#ccc',
      border: '1px solid #ffffff1a'
    },
    '& code': {
      padding: '.2em .4em',
      background: 'var(--cirrus-code-bg)',
      borderRadius: '3px',
      color: '#ccc',
      border: '1px solid #ffffff1a'
    }
  }
}, ({ content, classes }) => (
  <Markup
    class={classes.root}
    type='html'
    trim={false}
    markup={snarkdown(content)}
    components={{ Timer, Sponsors, ActionButton }}
  />
))

export default Markdown
