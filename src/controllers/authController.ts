import prisma from "../../prisma/client"
import { RequestHandler } from "express"
import {
  CustomRequestWithUser,
  LoginBodyDT,
  SignUpBodyDT,
  VerifyOtpDT,
} from "../lib/types/auth"
import createHttpError from "http-errors"
import bcrypt from "bcrypt"
import { generateToken } from "../lib/util/generateToken"
import { generateOTP } from "../lib/util/generateOTP"
import { sendOtpEmail } from "../lib/util/sendOtpEmail"

const signUp: RequestHandler<unknown, unknown, SignUpBodyDT, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const { fullName, email, phone, address, age, username, password } =
      req.body

    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !age ||
      !username ||
      !password
    ) {
      throw createHttpError(400, "Some fields are missing.")
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    })

    if (existingUser) {
      throw createHttpError(
        409,
        "User with this email or phone number already exists."
      )
    }

    const otpCode = generateOTP()
    await sendOtpEmail(email, otpCode)

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.oTP.create({
      data: {
        otp: otpCode,
        status: "unused",
        createdDT: new Date(),
        user: {
          create: {
            fullName,
            phone,
            email,
            address,
            age,
            username,
            password: hashedPassword,
            createdDT: new Date(),
          },
        },
      },
    })

    res.success(`OTP code sent to ${email}`)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

const verifyOtpCode: RequestHandler<
  unknown,
  unknown,
  VerifyOtpDT,
  unknown
> = async (req, res, next) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      throw createHttpError(400, "Email and OTP are required.")
    }

    const existingOTP = await prisma.oTP.findFirst({
      where: {
        otp,
        status: "unused",
        user: {
          email,
        },
      },
      include: {
        user: true,
      },
    })
    if (!existingOTP) {
      throw createHttpError(401, "Invalid OTP or email.")
    }

    await prisma.user.update({
      where: { id: existingOTP.user.id },
      data: {
        fullName: existingOTP.user.fullName,
        username: existingOTP.user.username,
        email: existingOTP.user.email,
        phone: existingOTP.user.phone,
        address: existingOTP.user.address,
        age: existingOTP.user.age,
        createdDT: existingOTP.user.createdDT,
      },
    })

    await prisma.oTP.update({
      where: { id: existingOTP.id },
      data: {
        status: "used",
      },
    })

    res.success("User registered successfully.", {
      token: generateToken(existingOTP.user.id),
    })
  } catch (error) {
    next(error)
  }
}

const login: RequestHandler<unknown, unknown, LoginBodyDT, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      throw createHttpError(400, "Username and password are required.")
    }

    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    })
    if (!user) {
      throw createHttpError(401, "Invalid username.")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw createHttpError(401, "Invalid password.")
    }

    res.success("Login successful.", {
      token: generateToken(user.id),
    })
  } catch (error) {
    next(error)
  }
}

const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  try {
    const authenticatedUserId = (req as CustomRequestWithUser).user.id
    if (!authenticatedUserId) {
      throw createHttpError(401, "User ID not found in request.")
    }

    const authenticatedUser = await prisma.user.findFirst({
      where: { id: authenticatedUserId },
    })
    if (!authenticatedUser) {
      throw createHttpError(404, "User not found.")
    }

    res.success("Authenticated user retrieved successfully.", {
      user: {
        id: authenticatedUser.id,
        fullName: authenticatedUser.fullName,
        username: authenticatedUser.username,
        email: authenticatedUser.email,
        phone: authenticatedUser.phone,
        address: authenticatedUser.address,
        age: authenticatedUser.age,
        createdDT: authenticatedUser.createdDT,
      },
    })
  } catch (error) {
    next(error)
  }
}

export default { signUp, verifyOtpCode, login, getAuthenticatedUser }
