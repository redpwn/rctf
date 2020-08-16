const path = require('path')
const fs = require('fs')

const tarballPath = process.argv[2]

const packagesPath = path.resolve(__dirname, '../packages')

const packages = fs.readdirSync(packagesPath)
  .map(f => path.resolve(packagesPath, f, 'package.json'))
  .filter(fs.existsSync)
  .map(f => JSON.parse(fs.readFileSync(f)))

const packageToTarball = (package) => {
  /** @type string */
  const name = package.name
  const transformedName = name.replace('/', '-').replace('@', '')
  const filename = `${transformedName}-v${package.version}.tgz`
  const fullpath = path.resolve(tarballPath, filename)
  if (!fs.existsSync(fullpath)) {
    throw new Error(`Missing package: ${filename} (${name}@${package.version})`)
  }
  return fullpath
}

const packageJson = {
  resolutions: Object.fromEntries(packages.map(p => [p.name, 'file:' + packageToTarball(p)]))
}

packageJson.dependencies = {
  '@rctf/server': packageJson.resolutions['@rctf/server']
}

fs.writeFileSync(process.argv[3], JSON.stringify(packageJson))
