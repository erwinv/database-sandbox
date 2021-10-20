import _ from 'lodash'
import faker from 'faker'
import { IUserCoupon } from '../model/usercoupon'

function fakeBarcode() {
  return {
    couponUserId: faker.random.alphaNumeric(10),
    isUsed: faker.datatype.boolean(),
    xcode: faker.random.alphaNumeric(15),
  }
}

export function fakeUserCoupon(override: Partial<IUserCoupon> = {}): Omit<IUserCoupon, '_id'> {
  _.defaultsDeep(override, {
    // _id: , // auto
    // _updated_at: , // auto
    // _created_at: , // auto

    startAt: faker.datatype.datetime(),
    expireAt: faker.datatype.datetime(),
    thumbnailImg: faker.image.imageUrl(),
    detailImg: faker.image.imageUrl(),
    name: faker.image.imageUrl(),
    promotionCode: faker.random.alphaNumeric(12),
    projectCode: faker.random.alphaNumeric(12),
    conditionUrl: faker.internet.url(),
    _p_partner: `Partner$${faker.random.alphaNumeric(10)}`,
    _p_user: `_User$${faker.random.alphaNumeric(10)}`,
    _p_coupon: `Coupon$${faker.random.alphaNumeric(10)}`,
    maxUse: faker.datatype.number(6),
    remainingUse: faker.datatype.number(6),
    isProcessing: faker.datatype.boolean(),
    isPrepaid: faker.datatype.boolean(),
    origin: faker.random.alphaNumeric(10),
    status: faker.random.word(),

    // barcodes: [],

    isUsed: faker.datatype.boolean(),
    isActive: faker.datatype.boolean(),
    gsStarIssue: {
      errorMessage: faker.random.words(6),
      errorCode: faker.random.alphaNumeric(6),
      issueStatus: faker.random.word(),
      issueDate: faker.datatype.datetime(),
      rewardId: faker.random.alphaNumeric(8),
      promotionId: faker.random.alphaNumeric(10),
      transactionId: faker.random.alphaNumeric(13),
      channelTranId: faker.datatype.uuid(),
    },
  })

  if (!_.isArray(override.barcodes)) {
    override.barcodes = []
  }

  if (_.isEmpty(override.barcodes)) {
    override.barcodes.push(fakeBarcode())
  } else {
    override.barcodes.forEach(barcode => {
      _.defaultsDeep(barcode, fakeBarcode())
    })
  }

  return override as IUserCoupon
}
