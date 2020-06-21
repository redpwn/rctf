import snarkdown from 'snarkdown'
import Markup from 'preact-markup'
import Timer from './timer'
import Sponsors from './sponsors'
import ActionButton from './action-button'

// From https://github.com/developit/snarkdown/issues/75?
const snarkdownEnhanced = (md) => {
  const htmls = md
    .split(/(?:\r?\n){2,}/)
    .map(l =>
      [' ', '\t', '#', '-', '*'].some(ch => l.startsWith(ch))
        ? snarkdown(l)
        : `<p>${snarkdown(l)}</p>`
    )

  return htmls.join('\n\n')
}

const Markdown = ({ content, components }) => (
  <Markup
    type='html'
    trim={false}
    markup={snarkdownEnhanced(content)}
    components={{ Timer, Sponsors, ActionButton, ...components }}
  />
)

export default Markdown
