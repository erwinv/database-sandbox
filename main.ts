import 'dotenv/config'

import app from './lib/app'
import env from './lib/env'
import setup from './lib/setup'

async function main() {
  await setup()
  app().listen(env.PORT, () => console.info(`Listening to port: ${env.PORT}`))
}

const runningAsMain = require.main === module
if (runningAsMain) {
  main()
}
