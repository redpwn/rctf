const { CLIEngine } = require('eslint')

const cli = new CLIEngine({})

const tsPackages = [
  'packages/server/',
  'packages/client/'
]

const extractPackage = file => /packages\/.*?\//.exec(file)?.[0]

const containsPackage = (files, package) => files.some(file => extractPackage(file) === package)

module.exports = {
  '*.{j,t}s?(x)': files => [
    'eslint --max-warnings=0 --fix ' + files.filter(file => !cli.isPathIgnored(file)).join(' '),
    'jest --ci --forceExit --findRelatedTests ' + files.join(' '),
    containsPackage(files, 'packages/client/') && 'jest --ci --forceExit packages/client/src/storyshots.test.ts'
  ].filter(Boolean),
  'packages/*/**/*.ts?(x)': files =>
    Array.from(new Set(files.map(extractPackage)))
      .filter(packageDir => tsPackages.includes(packageDir))
      .map(packageDir => `tsc -b ${packageDir}`)
}
