import deepMerge from 'deepmerge'
import base from '@theme-ui/preset-base'

export const theme = deepMerge(base, {
  fonts: {
    body: 'system-ui, sans-serif',
    heading: '"Avenir Next", sans-serif',
    monospace: 'Menlo, monospace'
  },
  colors: {
    text: '#eee',
    muted: '#888',
    background: '#111',
    cardBackground: '#222',
    primary: '#1e88e5',
    accent: '#f44336',
    danger: '#f44336'
  },
  cards: {
    primary: {
      p: 4,
      borderRadius: 4
    }
  }
})

export default theme
