import { RequestHandler, Request } from "express"
import createHttpError from "http-errors"
import UserModel from "../models/userModel"
import bcrypt from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken"
import userModel from "../models/userModel"

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

interface CustomRequestWithUser extends Request {
  user?: any
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

    res.status(201).json(newUser)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

const login: RequestHandler<unknown, unknown, LoginBody, unknown> = async (
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

const generateToken = (id: any) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "30d",
  })
}

const protect: RequestHandler<unknown, unknown, unknown, unknown> = async (
  req,
  res,
  next
) => {
  let token

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload

      // Get user from the token
      ;(req as CustomRequestWithUser).user = await UserModel.findById(
        decoded.id
      ).select("-password")

      return next()
    }
  } catch (error) {
    return next(createHttpError(401, "Not authorized, invalid token"))
  }

  // If token is missing
  return next(createHttpError(401, "Not authorized, no token"))
}

const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  try {
    res.json({ message: "me" })
  } catch (error) {
    next(error)
  }
}

export default { signUp, login, getAuthenticatedUser, protect }
