import { render } from 'preact'
import { loadConfig } from './config'
import App from './app'

void (async () => {
  await loadConfig()
  render(<App />, document.getElementById('app') as HTMLMetaElement)
})()
