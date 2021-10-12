import dotenv from 'dotenv'
import path from 'path'

export default async () => {
  dotenv.config({ path: path.resolve(process.cwd(), 'test', '.env.test') })
}
