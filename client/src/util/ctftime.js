import config from '../config'

const openPopup = ({ url, title, w, h }) => {
  const systemZoom = window.innerWidth / window.screen.availWidth
  const left = (window.innerWidth - w) / 2 / systemZoom + window.screenLeft
  const top = (window.innerHeight - h) / 2 / systemZoom + window.screenTop
  const popup = window.open(url, title, [
    'scrollbars',
    'resizable',
    `width=${w / systemZoom}`,
    `height=${h / systemZoom}`,
    `top=${top}`,
    `left=${left}`
  ].join(','))
  popup.focus()
}

const getState = () => Array.from(crypto.getRandomValues(new Uint8Array(16)))
  .map(v => v.toString(16).padStart(2, '0')).join('')

export default () => {
  const state = getState()
  openPopup({
    url: 'https://oauth.ctftime.org/authorize' +
    `?scope=${encodeURIComponent('team:read')}` +
    `&client_id=${encodeURIComponent(config.ctftime.clientId)}` +
    `&redirect_uri=${encodeURIComponent(`${location.origin}/integrations/ctftime/callback`)}` +
    `&state=${encodeURIComponent(state)}`,
    title: 'CTFtime',
    w: 600,
    h: 500
  })
  return state
}
