import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcrypt'
import { IUser, UserModel } from '../interface/user.interface'

const userSchema: Schema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: 0, required: true },
    role: {
      type: String,
      enum: ['user', 'organization', 'admin'],
      default: 'user',
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      // required: true,
    },
    avatars: { type: String },
    bio: { type: String, default: '' },
    street: { type: String, default: '' },
    postCode: { type: Number, default: null },
    phoneNum: { type: String, default: '' },
    dateOfBirth: { type: Date },

    // Keep extra fields you had earlier (if needed in your system)
    avatar: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    verificationInfo: {
      verified: { type: Boolean, default: false },
      token: { type: String, default: '' },
    },
    password_reset_token: { type: String, default: '' },
    refresh_token: { type: String, default: '' },
  },
  { timestamps: true }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this as any
  if (user.isModified('password')) {
    const saltRounds = Number(process.env.bcrypt_salt_round) || 10
    user.password = await bcrypt.hash(user.password, saltRounds)
  }
  next()
})

// Static methods
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password')
}

userSchema.statics.isOTPVerified = async function (id: string) {
  const user = await User.findById(id).select('+verificationInfo')
  return user?.verificationInfo.verified
}

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashPassword: string
) {
  return await bcrypt.compare(plainTextPassword, hashPassword)
}

export const User = mongoose.model<IUser, UserModel>('User', userSchema)
