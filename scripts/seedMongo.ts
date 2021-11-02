import 'dotenv/config'
import _ from 'lodash'
import * as threads from 'worker_threads'
import { DateTime } from 'luxon'
import setup, { teardownMongoose as teardown } from '../lib/database/mongo'
import UserCoupon from '../lib/model/usercoupon'
import { fakeUserCoupon } from '../lib/model/userCoupon.fake'
import { chunk, now, duration } from './util'

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
const MAX_BATCH_SIZE = 25000 // ThinkPad X13 AMD Ryzen 7 PRO 4750U (8 cores, 16 threads), 32GB RAM
// const MAX_BATCH_SIZE = 12500 // Ryzen 5 3600 (6 cores, 12 threads) 16GB RAM Desktop

const READY = 0
const TERMINATE = -1

async function main() {
  const [,, _total] = process.argv
  const total = _.toNumber(_total ?? '200000')

  const chunks = chunk(total, MAX_BATCH_SIZE)
  const workers = _.range(NUM_WORKERS).map(() => new threads.Worker(__filename))

  const start = now()

  await Promise.all(workers.map(worker => new Promise((resolve) => {
    worker.on('exit', resolve)
    worker.on('message', (value: number) => {
      if (value === READY) {
        const chunk = chunks.shift()
        if (!chunk) {
          worker.postMessage(TERMINATE)
        } else {
          worker.postMessage(chunk)
        }
      } else if (value > 0) {
        chunks.unshift(value)
      }
    })
  })))

  console.info(`Total: ${total} documents, ${NUM_WORKERS} threads, ${duration(start, 1)}s`)
}

async function worker(parentPort: threads.MessagePort) {
  await setup()

  let batchNumber = 0

  parentPort.on('message', async function work(value: number) {
    if (value === TERMINATE) {
      parentPort.removeListener('message', work)
      return teardown()
    }

    const batchSize = value
    try {
      await seedMongo(batchSize, `[thread#${threads.threadId}, batch#${++batchNumber}, size=${batchSize}] `)
      parentPort.postMessage(READY)
    } catch {
      batchNumber--
      parentPort.postMessage(batchSize)
      parentPort.postMessage(READY)
    }
  })

  parentPort.postMessage(READY)
}

const runningAsMain = require.main === module
if (runningAsMain) {
  if (threads.isMainThread) {
    main()
  } else {
    worker(threads.parentPort!)
  }
}
