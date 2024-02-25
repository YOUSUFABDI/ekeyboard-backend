import { RequestHandler } from "express"
import createHttpError from "http-errors"
import adminModel from "../models/adminModel"
import {
  CreateProductDT,
  LoginBodyDT,
  UpdateProductDT,
  signupBodyDT,
} from "lib/types"

const signup: RequestHandler<unknown, unknown, signupBodyDT, unknown> = async (
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

const login: RequestHandler<unknown, unknown, LoginBodyDT, unknown> = async (
  req,
  res,
  next
) => {
  const { username, password } = req.body

  try {
    const user = await adminModel.findOne({ adminUserName: username }).exec()
    if (!user) {
      throw createHttpError(401, "User not found")
    }

    if (user.adminPassword !== password) {
      throw createHttpError(400, "Username or password incorrect")
    }

    res.json({ message: "Login successful", user })
  } catch (error) {
    next(error)
  }
}

const getMe: RequestHandler = (req, res, next) => {}

const createProduct: RequestHandler<
  unknown,
  unknown,
  CreateProductDT,
  unknown
> = async (req, res, next) => {}

const updateProduct: RequestHandler<
  unknown,
  unknown,
  UpdateProductDT,
  unknown
> = async (req, res, next) => {}

const deleteProduct: RequestHandler = (req, res, next) => {}

const getProducts: RequestHandler = (req, res, next) => {}

const getOverviews: RequestHandler = (req, res, next) => {}

export default {
  signup,
  login,
  getMe,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getOverviews,
}
