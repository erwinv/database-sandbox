import 'dotenv/config'

import app, { initializeServiceDependencies } from './lib/app'
import env from './lib/env'

async function main() {
  await initializeServiceDependencies()
  app().listen(env.PORT, () => console.info(`Listening to port: ${env.PORT}`))
}

const runningAsMain = require.main === module
if (runningAsMain) {
  main()
}
