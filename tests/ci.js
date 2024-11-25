const { execSync } = require('child_process')
const { join } = require('path')

const cwd = join(__dirname, '../')
execSync('yarn test', { cwd, env: { ...process.env, CI: 'true' } })

if (execSync('git diff', { cwd }).length) {
  execSync('git add .', { cwd, stdio: 'inherit' })
  execSync('git diff --staged', { cwd, stdio: 'inherit' })
  setTimeout(() => {
    console.error(`No files should be changed after CI test. Please update snapshot locally.`)
    process.exit(1)
  }, 1000)
}
