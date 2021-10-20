import mongoose from 'mongoose'

// Collection Size: 22.62GB
// Total Documents: 32122689
// Indexes Total Size: 11.19GB

export interface IUserCoupon {
  // _id: mongoose.Types.ObjectId
  startAt: Date
  expireAt: Date
  // imageUrl: string
  thumbnailImg: string
  detailImg: string
  name: string
  promotionCode: string
  projectCode: string
  conditionUrl: string
  _p_partner: string
  _p_user: string
  _p_coupon: string
  maxUse: number
  remainingUse: number
  isProcessing: boolean
  isPrepaid: boolean
  origin: string
  status: string
  barcodes: Array<{
    couponUserId: string
    isUsed: boolean
    xcode: string
  }>
  _updated_at?: Date
  _created_at?: Date
  isUsed: boolean
  isActive: boolean

  // campaignCode: string
  // isSeen: boolean
  // transId: string
  // xCode: string
  // discountBarcode: string
  // statusFromCS: string
  // isTrueShakePremium: boolean
  // _p_breakfastRewardTicket: string
  // expiresBarcodeAt: string
  // transferTo: string
  // updatedAt: Date
  // expireFromCS: string
  // _p_rewardTicket: string
  gsStarIssue: {
    errorMessage: string
    errorCode: string
    issueStatus: string
    issueDate: Date
    rewardId: string
    promotionId: string
    transactionId: string
    channelTranId: string
  }
}

const Indexed = <T>(ctor: T) => ({
  type: ctor,
  index: true,
})

const userCouponSchema = new mongoose.Schema<IUserCoupon>({
    // _id: mongoose.Types.ObjectId,
    startAt: Date,
    expireAt: Date,
    // imageUrl: String,
    thumbnailImg: String,
    detailImg: String,
    name: String,
    promotionCode: String,
    projectCode: String,
    _p_partner: String,
    conditionUrl: String,
    _p_user: String,
    _p_coupon: String,
    maxUse: Number,
    remainingUse: Number,
    isProcessing: Boolean,
    isPrepaid: Boolean,
    origin: String,
    status: String,
    barcodes: [{
      couponUserId: String,
      isUsed: Boolean,
      xcode: String,
    }],
    isUsed: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // campaignCode: String,
    // isSeen: { type: Boolean, default: false },
    // transId: String,
    // xCode: String,
    // discountBarcode: String,
    // statusFromCS: String,
    // isTrueShakePremium: Boolean,
    // _p_breakfastRewardTicket: String,
    // expiresBarcodeAt: String,
    // transferTo: String,
    // updatedAt: Date,
    // expireFromCS: String,
    // _p_rewardTicket: String,
    gsStarIssue: {
      channelTranId: Indexed(String),
      transactionId: Indexed(String),
      promotionId: Indexed(String),
      rewardId: Indexed(String),
      issueDate: Indexed(Date),
      issueStatus: Indexed(String),
      errorCode: Indexed(String),
      errorMessage: String
    },
  }, {
    collection: 'UserCoupon',
    versionKey: false,
    strict: false, // prolly need since we don't know all fields
    // id: false, // don't use default mongoose ids
    timestamps: {
      createdAt: '_created_at',
      updatedAt: '_updated_at',
    },
  })

export default mongoose.model('UserCoupon', userCouponSchema)
