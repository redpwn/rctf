const { CLIEngine } = require('eslint')

const cli = new CLIEngine({})

module.exports = {
  '*.{j,t}s?(x)': files =>
    'eslint --max-warnings=0 --fix ' +files.filter(file => !cli.isPathIgnored(file)).join(' '),
  'server/**/*.ts?(x)': () => 'tsc --noEmit -p server',
  'client/**/*.ts?(x)': () => 'tsc --noEmit -p client',
}
