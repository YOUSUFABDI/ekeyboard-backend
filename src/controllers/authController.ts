import prisma from "../../prisma/client"
import { RequestHandler } from "express"
import {
  CustomRequestWithUser,
  LoginBodyDT,
  SignUpBodyDT,
  UdateUserDT,
  UpdatePasswordDT,
  VerifyOtpDT,
} from "../types/auth"
import createHttpError from "http-errors"
import bcrypt from "bcrypt"
import { generateToken } from "../util/generateToken"
import { generateOTP } from "../util/generateOTP"
import { sendOtpEmail } from "../util/sendOtpEmail"

const signUp: RequestHandler<unknown, unknown, SignUpBodyDT, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const { fullName, email, phone, address, age, username, password, role } =
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
            role,
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
        role: existingOTP.user.role,
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
      username: user.username,
      token: generateToken(user.id),
      role: user.role,
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
        role: authenticatedUser.role,
        fullName: authenticatedUser.fullName,
        username: authenticatedUser.username,
        email: authenticatedUser.email,
        phone: authenticatedUser.phone,
        photo: authenticatedUser.photo,
        address: authenticatedUser.address,
        age: authenticatedUser.age,
        createdDT: authenticatedUser.createdDT,
      },
    })
  } catch (error) {
    next(error)
  }
}

const updateAdminInfo: RequestHandler<
  unknown,
  unknown,
  UdateUserDT,
  unknown
> = async (req, res, next) => {
  try {
    const { fullName, age, address, phone } = req.body
    if (!fullName || !age || !address || !phone) {
      throw createHttpError(400, "Some fields are missing.")
    }

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

    await prisma.user.update({
      where: { id: authenticatedUser.id },
      data: {
        fullName,
        age,
        address,
        phone,
      },
    })

    res.success("User updated successfully.")
  } catch (error) {
    next(error)
  }
}

const updatePassword: RequestHandler<
  unknown,
  unknown,
  UpdatePasswordDT,
  unknown
> = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      throw createHttpError(
        400,
        "Current password and new password are required."
      )
    }

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

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      authenticatedUser.password
    )
    if (!isPasswordValid) {
      throw createHttpError(401, "Invalid current password.")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: authenticatedUser.id },
      data: {
        password: hashedPassword,
      },
    })

    res.success("Password updated successfully.")
  } catch (error) {
    next(error)
  }
}

export default {
  signUp,
  verifyOtpCode,
  login,
  getAuthenticatedUser,
  updateAdminInfo,
  updatePassword,
}
