import { RequestHandler } from "express"
import createHttpError from "http-errors"
import adminModel from "../models/adminModel"

interface LoginBody {
  username: string
  password: string
}

interface signupBody {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  username?: string
  password?: string
}

const login: RequestHandler<unknown, unknown, LoginBody, unknown> = async (
  req,
  res,
  next
) => {
  const { username, password } = req.body

  try {
    const user = await adminModel.findOne({ adminUserName: username }).exec()
    if (!user) {
      throw createHttpError(401, "Invalid username or password")
    }

    res.json({ message: "Login successful", user })
  } catch (error) {
    next(error)
  }
}

const signup: RequestHandler<unknown, unknown, signupBody, unknown> = async (
  req,
  res,
  next
) => {
  const { fullName, email, phone, address, username, password } = req.body

  if (!fullName || !email || !phone || !address || !username || !password) {
    throw createHttpError(400, "Parameters missing")
  }

  try {
    const newUser = await adminModel.create({
      adminEmail: email.toString(),
      adminFullName: fullName,
      adminPhone: phone,
      adminAddress: address,
      adminUserName: username,
      adminPassword: password,
    })

    res.status(201).json(newUser)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export default { login, signup }
