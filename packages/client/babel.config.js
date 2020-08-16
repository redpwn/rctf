module.exports = api => {
  const env = api.cache(() => process.env.NODE_ENV)

  return {
    presets: [
      ['@babel/preset-typescript', {
        isTSX: true,
        allExtensions: true
      }],
      ['@babel/preset-react', {
        pragma: 'jsx',
        pragmaFrag: 'Fragment'
      }],
      ['@babel/preset-env', {
        targets: { esmodules: true }
      }]
    ],
    plugins: [
      ...(env === 'development' ? [
        'react-refresh/babel'
      ] : [])
    ]
  }
}
