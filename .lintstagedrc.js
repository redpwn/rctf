const { CLIEngine } = require('eslint')

const cli = new CLIEngine({})

module.exports = {
  '*.{j,t}s?(x)': files =>
    'eslint --max-warnings=0 --fix ' +files.filter(file => !cli.isPathIgnored(file)).join(' '),
  '*.{j,t}s?(x)': () => 'jest --projects client server -o --ci --forceExit',
  'server/**/*.ts?(x)': () => 'tsc -b server',
  'client/**/*.ts?(x)': () => 'tsc -b client',
}
