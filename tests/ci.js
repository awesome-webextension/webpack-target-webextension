const { execSync } = require('child_process')
const { join } = require('path')
execSync('yarn jest', {
  cwd: join(__dirname, '../'),
})
