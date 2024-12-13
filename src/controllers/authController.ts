import prisma from "../../prisma/client"
import { RequestHandler } from "express"
import {
  CustomRequestWithUser,
  LoginBodyDT,
  SignUpBodyDT,
  UdateUserDT,
  UpdatePasswordDT,
  UpdateProfileImgDT,
  VerifyOtpDT,
} from "../types/auth"
import createHttpError from "http-errors"
import bcrypt from "bcrypt"
import { generateToken } from "../util/generateToken"
import { generateOTP } from "../util/generateOTP"
import { sendOtpEmail } from "../util/sendOtpEmail"
import cloudinary from "../util/cloudinary"

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
      username: existingOTP.user.username,
      token: generateToken(existingOTP.user.id),
      role: existingOTP.user.role,
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

const forgotPassword: RequestHandler<
  unknown,
  unknown,
  { email: string },
  unknown
> = async (req, res, next) => {
  const { email } = req.body
  if (!email) {
    throw createHttpError(400, "Email is required.")
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw createHttpError(404, "User not found.")
    }

    const otp = generateOTP()

    // Save OTP in the database
    await prisma.oTP.create({
      data: {
        otp,
        status: "pending",
        userId: user.id,
      },
    })

    await sendOtpEmail(email, otp)

    res.success(`Password reset OTP sent successfully to ${email}`)
  } catch (error) {
    console.error(error)
    next(error)
  }
}

const resetPassword: RequestHandler<
  unknown,
  unknown,
  { otp: number; newPassword: string },
  unknown
> = async (req, res, next) => {
  const { otp, newPassword } = req.body

  // Validate the inputs
  if (
    !otp ||
    !newPassword ||
    typeof otp !== "number" ||
    !Number.isInteger(otp)
  ) {
    throw createHttpError(
      400,
      "OTP must be a valid number and a new password is required"
    )
  }

  try {
    const otpEntry = await prisma.oTP.findFirst({
      where: { otp, status: "pending" },
      include: { user: true },
    })
    if (!otpEntry) {
      throw createHttpError(400, "Invalid or expired OTP")
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the user's password
    await prisma.user.update({
      where: { id: otpEntry.userId },
      data: { password: hashedPassword },
    })

    // Mark the OTP as used
    await prisma.oTP.update({
      where: { id: otpEntry.id },
      data: { status: "used" },
    })

    res.success("Password reset successful")
  } catch (error) {
    console.error(error)
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

const changeProfileImg: RequestHandler<
  unknown,
  unknown,
  UpdateProfileImgDT,
  unknown
> = async (req, res, next) => {
  try {
    const { profileImg } = req.body
    if (!profileImg) {
      throw createHttpError(400, "profileImg is required.")
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

    // Delete the old profile image from Cloudinary if it exists and is not the default placeholder
    if (
      authenticatedUser.photo &&
      authenticatedUser.photo !==
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6NYW3a3rRNPiE4LaF3IPYE3n23CFaNmHe8pvoPqyE9g&s"
    ) {
      try {
        const urlSegments = authenticatedUser.photo.split("/")
        const publicIdWithExtension = urlSegments[urlSegments.length - 1]
        const publicId = publicIdWithExtension.split(".")[0] // Extract public_id without file extension
        await cloudinary.uploader.destroy(`Ekeyboard/${publicId}`) // Include folder in publicId path
      } catch (deleteError) {
        console.error(
          "Failed to delete old image from Cloudinary:",
          deleteError
        )
      }
    }

    // Upload the new image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profileImg, {
      folder: "Ekeyboard",
      resource_type: "image",
    })

    // Update the user's profile image in the database
    const updatedUser = await prisma.user.update({
      where: { id: authenticatedUserId },
      data: { photo: uploadResponse.secure_url },
    })

    // Respond with success
    res.success("Profile image updated successfully", updatedUser)
  } catch (error) {
    next(error)
  }
}

export default {
  signUp,
  verifyOtpCode,
  login,
  forgotPassword,
  resetPassword,
  getAuthenticatedUser,
  updateAdminInfo,
  updatePassword,
  changeProfileImg,
}
