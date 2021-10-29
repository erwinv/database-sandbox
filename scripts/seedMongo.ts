import 'dotenv/config'
import _ from 'lodash'
import * as threads from 'worker_threads'
import setup, { teardownMongoose as teardown } from '../lib/database/mongo'
import UserCoupon from '../lib/model/usercoupon'
import { fakeUserCoupon } from '../lib/controller/userCoupon.fake'
import { chunk, pigeonhole, now, duration } from './util'

async function seedMongo(total: number, logPrefix = '') {
  let start = now()
  const userCoupons = _.range(total).map(() => fakeUserCoupon())
  console.info(`${logPrefix}Generate fake data duration: ${duration(start)}s`)

  start = now()
  await UserCoupon.insertMany(userCoupons)
  console.info(`${logPrefix}Insert duration: ${duration(start, 1)}s`)
}

// optimal values for AMD Ryzen 7 PRO 4750U (8 core, 16 threads), 32GB RAM
// 200,000 writes per 40 seconds or 5,000 writes per second
const NUM_WORKERS = 8
const MAX_BATCH_SIZE = 12500

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
  const batchSize = Math.min(total, MAX_BATCH_SIZE)

  await setup()
  try {
    let batchNumber = 0;
    let thisBatchSize = batchSize;
    for (let remaining = total; remaining > 0; remaining -= thisBatchSize) {
      batchNumber++;
      thisBatchSize = Math.min(remaining, batchSize);
      await seedMongo(batchSize, `[thread#${threads.threadId}, batch#${batchNumber}, size=${thisBatchSize}] `)
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
