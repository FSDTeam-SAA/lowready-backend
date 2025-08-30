import { Document, Model } from 'mongoose'

export interface IUser extends Document {
  _id: string
  firstName: string
  lastName: string
  email: string
  password?: string
  role: 'user' | 'organization' | 'admin'
  gender: 'male' | 'female'
  bio?: string
  street?: string
  postCode?: number
  phoneNum?: string
  dateOfBirth?: Date
  avatars?: string
  stripeAccountId?: string
  onboardingStatus?: boolean
  accountLink?: string

  // Extra fields
  avatar?: {
    public_id: string
    url: string
  }
  verificationInfo: {
    verified: boolean
    token: string
  }
  password_reset_token: string
  fine: number
  refresh_token: string
  totalTour: number
  totalPlacement: number
}

export type TLoginUser = {
  email: string
  password: string
}

export interface UserModel extends Model<IUser> {
  isUserExistsByEmail(email: string): Promise<IUser | null>
  isOTPVerified(id: string): Promise<boolean>
  isPasswordMatched(
    plainTextPassword: string,
    hashPassword: string
  ): Promise<boolean>
}
