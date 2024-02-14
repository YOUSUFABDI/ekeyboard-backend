import { RequestHandler } from "express"
import createHttpError from "http-errors"
import UserModel from "../models/userModel"

interface SignUpBody {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  age?: number
  username?: string
  password?: string
}

interface LoginBody {
  username: string
  password: string
}

const signUp: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (
  req,
  res,
  next
) => {
  const { fullName, email, phone, address, age, username, password } = req.body

  try {
    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !age ||
      !username ||
      !password
    ) {
      throw createHttpError(400, "Parameters missing")
    }

    const existingUsername = await UserModel.findOne({
      username: username,
    }).exec()
    if (existingUsername) {
      throw createHttpError(
        409,
        "Username already token. Please choose different username"
      )
    }

    const existingEmail = await UserModel.findOne({ email: email }).exec()
    if (existingEmail) {
      throw createHttpError(
        409,
        "Email already token. Please choose different email"
      )
    }

    const existingPhone = await UserModel.findOne({ phone: phone }).exec()
    if (existingPhone) {
      throw createHttpError(
        409,
        "Phone already token. Please choose different phone"
      )
    }

    const newUser = await UserModel.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      address,
      age,
      username,
      password,
    })

    res.status(201).json(newUser)
  } catch (error) {
    next(error)
  }
}

const login: RequestHandler<unknown, unknown, LoginBody, unknown> = async (
  req,
  res,
  next
) => {}

const getAuthenticatedUser: RequestHandler = async (req, res, next) => {}

export default { signUp, login, getAuthenticatedUser }
