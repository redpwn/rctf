interface ClientConfig {
  ctfTitle: string
}

// config will not be null by the time the app is mounted
const config: ClientConfig = {} as ClientConfig

const loadConfig = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    const { data } = await (await fetch('/api/v1/integrations/client/config')).json() as { data: ClientConfig }
    Object.assign(config, data)
  } else if (process.env.NODE_ENV === 'production') {
    const el = document.querySelector('[name=rctf-config]') as HTMLMetaElement
    Object.assign(config, JSON.parse(el.content))
  } else {
    throw new Error('invalid NODE_ENV')
  }
}

export { loadConfig }
export default config
