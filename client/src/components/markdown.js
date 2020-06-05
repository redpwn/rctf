import snarkdown from 'snarkdown'
import Markup from 'preact-markup'
import Timer from './timer'
import Sponsors from './sponsors'

const Markdown = ({ content }) => (
  <Markup
    type='html'
    trim={false}
    markup={snarkdown(content)}
    components={{ Timer, Sponsors }}
  />
)

export default Markdown
