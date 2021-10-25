import http from 'k6/http'
import { check, fail, sleep } from 'k6'
import {
  randomIntBetween,
  randomItem,
  randomString,
  uuidv4,
} from 'https://jslib.k6.io/k6-utils/1.1.0/index.js'

export const options = {
  // https://k6.io/docs/test-types/smoke-testing/
  // vus: 1,
  // duration: '1m',

  stages: [
    // https://k6.io/docs/test-types/load-testing/
    { duration: '2m', target: 100 },
    { duration: '6m', target: 100 },
    { duration: '2m', target: 0 },

    // https://k6.io/docs/test-types/stress-testing/
    // { duration: '2m', target: 100 }, // below normal load
    // { duration: '5m', target: 100 },
    // { duration: '2m', target: 200 }, // normal load
    // { duration: '5m', target: 200 },
    // { duration: '2m', target: 300 }, // around the breaking point
    // { duration: '5m', target: 300 },
    // { duration: '2m', target: 400 }, // beyond the breaking point
    // { duration: '5m', target: 400 },
    // { duration: '10m', target: 0 }, // scale down. Recovery stage.

    // https://k6.io/docs/test-types/soak-testing/
    // { duration: '2m', target: 400 }, // ramp up to 400 users
    // { duration: '3h56m', target: 400 }, // stay at 400 for ~4 hours
    // { duration: '2m', target: 0 }, // scale down. (optional)
  ],

  // TODO explore "scenarios"
  // https://k6.io/docs/using-k6/scenarios/
}

const SLEEP_DURATION = 0.2

export function setup() {
  let res = {}
  let pass = false

  const initialRequest = randomItem(['createNew', 'randomSample'])

  switch (initialRequest) {
  case 'createNew':
    res = http.post('http://localhost:8765/usercoupon?fake=1',
      {
        tags: { name: 'createCoupon' }
      }
    )
    pass = check(res, { 'CREATE OK': (r) => r.status == 201 })
    break;
  case 'randomSample':
  default:
    res = http.get('http://localhost:8765/usercoupon?sample=1', 
      {
        tags: { name: 'getCoupon' }
      }
    )
    pass = check(res, { 'GET OK': (r) => r.status == 200 })
  }

  if (!pass) {
    fail('creation/random sampling failed')
  }
  sleep(SLEEP_DURATION)

  return { usercoupon: res.json() }
}

export default function ({ usercoupon }) {
  let res = {}

  const headers = {
    'content-type': 'application/json'
  }
  const patchRequests = [{
    maxUse: randomIntBetween(1, 6),
    remainingUse: randomIntBetween(1, 6),
    isProcessing: !usercoupon.isProcessing,
  }, {
    isPrepaid: !usercoupon.isPrepaid,
    origin: randomString(10),
    isUsed: !usercoupon.isUsed,
  }, {
    isActive: !usercoupon.isActive,
    gsStarIssue: {
      channelTranId: uuidv4(),
    },
  }]

  for (const patchRequest of patchRequests) {
    res = http.patch(
      http.url`http://localhost:8765/usercoupon/${usercoupon._id}`,
      JSON.stringify(patchRequest),
      {
        headers,
        tags: { name: 'updateCoupon' }
      }
    )

    if (!check(res, { 'PATCH OK': (r) => r.status == 200 })) {
      fail('PATCH failed')
    }

    sleep(SLEEP_DURATION)
  }
}
