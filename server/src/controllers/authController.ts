import { RequestHandler } from "express"
import UserModel from "../models/user"

interface SignUpBody {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  age?: number
  username?: string
  password?: string
}

const signUp: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (
  req,
  res,
  next
) => {
  try {
    console.log(req.body)
    return res.status(200).json({ msg: "ok" })
  } catch (error) {
    next(error)
  }
}

const login = async (req: any, res: any) => {}

export default { signUp, login }
