import mongoose from 'mongoose'
import env from '../env'

// Version: 4.0.27
// Region: AWS Singapore (ap-southeast-1)
// Cluster Tier: M30
// Encrypted Storage: true 

// Tier: M30
// RAM: 8 GB
// Storage: 40 GB
// vCPU: 2 vCPUs

let connection: ReturnType<typeof mongoose.connect>

export default async function initializeMongoose() {
  if (!connection) {
    connection = mongoose.connect(env.MONGODB_URI.toString(), {
      user: env.MONGODB_USER,
      pass: env.MONGODB_PASSWORD,
    })
  }

  return connection
}

export async function teardownMongoose() {
  await mongoose.disconnect()
}
