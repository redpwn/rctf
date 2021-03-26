import { render } from 'preact'
import { loadConfig } from './config'
import App from './app'

void (async () => {
  await loadConfig()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  render(<App />, document.getElementById('app')!)
})()
