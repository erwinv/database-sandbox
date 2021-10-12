import 'dotenv/config'

import app from './lib/app'
import env from './lib/env'

app().listen(env.PORT, () => console.log(`Listening to port: ${env.PORT}`))
