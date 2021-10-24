import supertest from 'supertest'
import app from './app'

const api = supertest.agent(app().callback())

function pingTest(path: string) {
  return async () => {
    const response = await api.get(path)
    expect(response.status).toBe(200)
    expect(response.text).toBe<string>('pong')
  }
}
test('GET /', pingTest('/'))
test('GET /ping', pingTest('/ping'))

test('GET /info', async () => {
  const response = await api.get('/info')
  expect(response.status).toBe(200)
  expect(response.body).toEqual(expect.objectContaining({
    platform: process.platform,
    release: process.release,
    versions: process.versions,
    uptime: expect.any(Number),
    cpu: expect.objectContaining({
      user: expect.any(Number),
      system: expect.any(Number),
    }),
    mem: expect.objectContaining({
      rss: expect.any(Number),
      heapTotal: expect.any(Number),
      heapUsed: expect.any(Number),
      external: expect.any(Number),
      arrayBuffers: expect.any(Number),
    }),
  }))
})

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const userCouponStructureMatcher = expect.objectContaining({
  // _id : expect.any(String),
  // _created_at: expect.stringMatching(DATE_REGEX),
  // _updated_at: expect.stringMatching(DATE_REGEX),
  startAt: expect.stringMatching(DATE_REGEX),
  expireAt: expect.stringMatching(DATE_REGEX),
  thumbnailImg: expect.any(String),
  detailImg: expect.any(String),
  name: expect.any(String),
  promotionCode: expect.any(String),
  projectCode: expect.any(String),
  conditionUrl: expect.any(String),
  _p_partner: expect.any(String),
  _p_user: expect.any(String),
  _p_coupon: expect.any(String),
  maxUse: expect.any(Number),
  remainingUse: expect.any(Number),
  isProcessing: expect.any(Boolean),
  isPrepaid: expect.any(Boolean),
  origin: expect.any(String),
  status: expect.any(String),
  barcodes: expect.arrayContaining([ // assume array is homogenous
    expect.objectContaining({
      couponUserId: expect.any(String),
      isUsed: expect.any(Boolean),
      xcode: expect.any(String),
    })
  ]),
  isUsed: expect.any(Boolean),
  isActive: expect.any(Boolean),
  gsStarIssue: expect.objectContaining({
    errorMessage: expect.any(String),
    errorCode: expect.any(String),
    issueStatus: expect.any(String),
    issueDate: expect.stringMatching(DATE_REGEX),
    rewardId: expect.any(String),
    promotionId: expect.any(String),
    transactionId: expect.any(String),
    channelTranId: expect.any(String),
  }),
})

test('POST /usercoupon?fake=1', async () => {
  const response = await api.post('/usercoupon?fake=1')
  expect(response.status).toBe(201)
  expect(response.body).toEqual(userCouponStructureMatcher)
})

test('GET /usercoupon?sample=1', async () => {
  const response = await api.get('/usercoupon?sample=1')
  expect(response.status).toBe(200)
  expect(response.body).toEqual(userCouponStructureMatcher)
})
