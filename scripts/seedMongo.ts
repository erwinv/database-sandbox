import 'dotenv/config'
import _ from 'lodash'
import * as threads from 'worker_threads'
import setup, { teardownMongoose as teardown } from '../lib/database/mongo'
import UserCoupon from '../lib/model/usercoupon'
import { fakeUserCoupon } from '../lib/controller/userCoupon.fake'

function now() {
  return parseInt(`${process.hrtime.bigint() / 1000000n}`, 10)
}

function duration(start: number, precision = 3) {
  return ((now() - start) / 1000).toFixed(precision)
}

async function seedMongo(total: number, logPrefix = '') {
  console.log(`${logPrefix}Inserting ${total} documents...`)

  let start = now()
  const userCoupons = _.range(0, total).map(() => fakeUserCoupon())
  console.info(`${logPrefix}Chunk generation duration: ${duration(start)}s`)

  start = now()
  await UserCoupon.insertMany(userCoupons)
  console.info(`${logPrefix}Insert duration: ${duration(start, 1)}s`)
}

function main() {
  const NUM_WORKERS = 4

  const [,, total] = process.argv
  const totalPerWorker = _.round(_.toNumber(total ?? '100000') / NUM_WORKERS)

  const start = now()

  let doneWorkers = 0
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = new threads.Worker(__filename, { workerData: totalPerWorker })
    worker.on('exit', () => {
      if (++doneWorkers === NUM_WORKERS) {
        console.info(`Total duration: ${duration(start, 1)}s`)
      }
    })
  }
}

async function worker() {
  const MAX_BATCH_SIZE = 25000

  const total = threads.workerData as number
  const batchSize = Math.min(total, MAX_BATCH_SIZE)

  await setup()
  try {
    let batchNumber = 1
    for (let remaining = total; remaining > 0; remaining -= batchSize, batchNumber++) {
      await seedMongo(batchSize, `[thread#${threads.threadId}] [batch#${batchNumber}] `)
    }
  } finally {
    await teardown()
  }
}

const runningAsMain = require.main === module
if (runningAsMain) {
  if (threads.isMainThread) {
    main()
  } else {
    worker()
  }
}
