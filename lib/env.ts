import { format } from 'util'
import { EnvVars, num } from '@erwinv/envvar'

const envVars = new EnvVars({
  PORT: num(),
})

const runningAsMain = require.main === module
if (runningAsMain) {
  try {
    process.stdout.write(envVars.example())
    process.exit(0)
  } catch(e) {
    process.stderr.write(format(e))
    process.exit(1)
  }
}

export default envVars.resolve()
