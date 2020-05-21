import snarkdown from 'snarkdown'
import Markup from 'preact-markup'

const Markdown = ({ content }) => (
  <Markup type='html' trim={false} markup={snarkdown(content)} />
)

export default Markdown
