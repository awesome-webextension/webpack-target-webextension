const { execSync } = require('child_process')
const { join } = require('path')

const cwd = join(__dirname, '../')
execSync('yarn test', { cwd, env: { ...process.env, CI: 'true' } })

if (execSync('git diff', { cwd }).length) {
  execSync('git diff', { cwd, stdio: 'inherit' })
  throw new Error(`No files should be changed after CI test. Please update snapshot locally.`)
}
