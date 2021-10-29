import 'dotenv/config'
import _ from 'lodash'
import * as threads from 'worker_threads'
import { DateTime } from 'luxon'
import setup, { teardownMongoose as teardown } from '../lib/database/mongo'
import UserCoupon from '../lib/model/usercoupon'
import { fakeUserCoupon } from '../lib/model/userCoupon.fake'
import { chunk, pigeonhole, now, duration } from './util'

async function seedMongo(total: number, logPrefix = '') {
  let start = now()
  const overrideCreationTime: any = {
    _created_at: DateTime.local().toUTC()
      .minus({ months: _.random(4, 48) })
      .toISO(),
  }
  const userCoupons = _.range(total).map(() => fakeUserCoupon(overrideCreationTime))
  console.info(`${logPrefix}Generate fake data duration: ${duration(start)}s`)

  start = now()
  await UserCoupon.insertMany(userCoupons)
  console.info(`${logPrefix}Insert duration: ${duration(start, 1)}s`)
}

// machine-specific optimal values
const NUM_WORKERS = 8
const MAX_BATCH_SIZE = 25000 // ThinkPad X13 AMD Ryzen 7 PRO 4750U (8 core, 16 threads), 32GB RAM
// const MAX_BATCH_SIZE = 12500 // Ryzen 5 3600 16GB RAM Desktop

function main() {
  const [,, _total] = process.argv
  const total = _.toNumber(_total ?? '200000')

  const totalsPerWorker = pigeonhole(chunk(total, MAX_BATCH_SIZE), NUM_WORKERS)

  const start = now()

  let doneWorkers = 0
  for (const totalOfWorker of totalsPerWorker) {
    const worker = new threads.Worker(__filename, {
      workerData: totalOfWorker
    })
    worker.on('exit', () => {
      if (++doneWorkers === NUM_WORKERS) {
        console.info(`Total: ${total} documents, ${NUM_WORKERS} threads, ${duration(start, 1)}s`)
      }
    })
  }
}

async function worker() {
  const total = threads.workerData as number

  await setup()
  try {
    for (const [i, batchSize] of chunk(total, MAX_BATCH_SIZE).entries()) {
      await seedMongo(batchSize, `[thread#${threads.threadId}, batch#${i+1}, size=${batchSize}] `)
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
