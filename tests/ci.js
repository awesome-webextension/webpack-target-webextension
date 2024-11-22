const { execSync } = require('child_process')
const { join } = require('path')

const cwd = join(__dirname, '../')
execSync('yarn test', { cwd })

const out = execSync('git diff', { cwd })
if (out.length) throw new Error(`No files should be changed after CI test. Please update snapshot locally.`)
