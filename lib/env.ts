import { format } from 'util'
import { EnvVars, num, str, url } from '@erwinv/envvar'

const envVars = new EnvVars({
  PORT: num(),
  MONGODB_URI: url().default(new URL('mongodb://localhost:27017/test')),
  MONGODB_USER: str(),
  MONGODB_PASSWORD: str(),
  POSTGRES_HOST: str().default('localhost'),
  POSTGRES_USER: str(),
  POSTGRES_PASSWORD: str(),
  POSTGRES_DATABASE: str().default('test'),
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
