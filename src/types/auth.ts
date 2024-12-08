import { Request } from "express"

export type SignUpBodyDT = {
  fullName: string
  email: string
  phone: string
  address: string
  age: number
  username: string
  password: string
  role?: string
}

export type VerifyOtpDT = {
  email: string
  otp: number
}

export type LoginBodyDT = {
  username: string
  password: string
}

// export interface CustomRequestWithUser extends Request {
//   user?: {
//     id: number
//     role: string
//   }
// }

export interface CustomRequestWithUser extends Request<{ id: string }> {
  user?: {
    id: number
    role: string
  }
}

export type UdateUserDT = {
  fullName: string
  phone: string
  address: string
  age: number
}

export type UpdatePasswordDT = {
  currentPassword: string
  newPassword: string
}

export type UpdateProfileImgDT = {
  profileImg: string
}
