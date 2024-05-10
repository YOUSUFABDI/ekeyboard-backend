import bcrypt from "bcrypt"
import { RequestHandler } from "express"
import createHttpError from "http-errors"
import { generateToken } from "../lib/util/generateToken"
import { default as UserModel, default as userModel } from "../models/userModel"
import {
  SignUpBodyDT,
  LoginBodyDT,
  CustomRequestWithUser,
} from "../lib/types/auth"

const signUp: RequestHandler<unknown, unknown, SignUpBodyDT, unknown> = async (
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
        "Username already taken. Please choose different username"
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await UserModel.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      address,
      age,
      username,
      password: hashedPassword,
    })

    if (newUser) {
      res.status(201).json({
        token: generateToken(newUser._id),
        username: newUser.username,
        _id: newUser.id,
      })
    } else {
      throw createHttpError(400, "Invalid user data")
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
}

const login: RequestHandler<unknown, unknown, LoginBodyDT, unknown> = async (
  req,
  res,
  next
) => {
  const { username, password } = req.body
  try {
    // chech user in the database
    const user = await userModel
      .findOne({
        username: username,
      })
      .exec()
    if (!user) {
      throw createHttpError(400, "User not found")
    }

    // chech password in the dataabase
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw createHttpError(400, "Password not valid")
    }

    res.json({
      token: generateToken(user._id),
      username: user.username,
      _id: user.id,
    })
  } catch (error) {
    next(error)
    console.log("erroka" + error)
  }
}

const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  try {
    const authenticatedUserId = (req as CustomRequestWithUser).user?.id

    if (!authenticatedUserId) {
      throw createHttpError(400, "User ID not found in request")
    }

    const authenticatedUser = await UserModel.findById(
      authenticatedUserId
    ).select("-password")

    if (!authenticatedUser) {
      throw createHttpError(404, "User not found")
    }

    res.json(authenticatedUser)
  } catch (error) {
    next(error)
  }
}

export default { signUp, login, getAuthenticatedUser }
