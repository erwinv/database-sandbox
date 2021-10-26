import 'dotenv/config'
import _ from 'lodash'
// import cluster from 'cluster'
// import { cpus } from 'os'
import setup from '../lib/setup'
import UserCoupon from '../lib/model/usercoupon'
import { fakeUserCoupon } from '../lib/controller/userCoupon.fake'

async function seedMongo(total: number, chunk: number) {
  const start = parseInt(`${process.hrtime.bigint() / 1000000n}`, 10)
  let last = start
  for (const batch of _.chunk(_.range(0, total), chunk)) {
    await UserCoupon.insertMany(batch.map(() => fakeUserCoupon()))
    const now = parseInt(`${process.hrtime.bigint() / 1000000n}`, 10)
    console.info(`Inserted batch: ${_.first(batch)}-${_.last(batch)}, delta: ${((now-last)/1000).toFixed(1)}s, total: ${((now-start)/1000).toFixed(1)}s`)
    last = now
  }
}

// async function seedPostgres() {
// }

async function main() {
  const [,, total] = process.argv
  const { teardown } = await setup()

  try {
    await seedMongo(_.toNumber(total ?? '10000'), 1000)
    // await seedPostgres()
  } finally {
    await teardown()
  }
}

const runningAsMain = require.main === module
if (runningAsMain) {
  main()
}
