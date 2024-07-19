import { Request } from "express"

export type SignUpBodyDT = {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  age?: number
  username?: string
  password?: string
}

export type VerifyOtpDT = {
  email: string
  otp: number
}

export type LoginBodyDT = {
  username: string
  password: string
}

export interface CustomRequestWithUser extends Request {
  user?: {
    id: unknown
    role: string
  }
}
