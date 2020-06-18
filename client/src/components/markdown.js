import snarkdown from 'snarkdown'
import Markup from 'preact-markup'
import Timer from './timer'
import Sponsors from './sponsors'
import ActionButton from './action-button'

const Markdown = ({ content }) => (
  <Markup
    type='html'
    trim={false}
    markup={snarkdown(content)}
    components={{ Timer, Sponsors, ActionButton }}
  />
)

export default Markdown
