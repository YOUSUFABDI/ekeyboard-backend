import { RequestHandler } from "express"
import createHttpError from "http-errors"
import adminModel from "../models/adminModel"
import productModel from "../models/productModel"
import { generateToken } from "../lib/utils"
import jwt, { JwtPayload } from "jsonwebtoken"
import {
  CreateProductDT,
  LoginBodyDT,
  UpdateProductDT,
  deleteProductParamsDT,
  signupBodyDT,
  updateProductParamsDT,
} from "lib/types"
import userModel from "../models/userModel"
import orderModel from "../models/orderModel"
import { v2 as cloudinary } from "cloudinary"

// Initialize Cloudinary
// cloudinary.config({
//   cloud_name: "dwik9lulf",
//   api_key: "466784638783261",
//   api_secret: "aJCCYt81L5DftVyKIRcHLirR4h4",
// })

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
    // check if the user already exists
    const user = await adminModel
      .findOne({
        adminEmail: email,
      })
      .exec()
    if (user) {
      throw createHttpError(409, "User already Exists.")
    }

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

    if (password !== user.adminPassword) {
      throw createHttpError(400, "Username or password incorrect")
    }

    res.json({
      token: generateToken(user._id),
      username: user.adminUserName,
      _id: user._id,
    })
  } catch (error) {
    next(error)
  }
}

const protect: RequestHandler<unknown, unknown, unknown, unknown> = async (
  req,
  res,
  next
) => {
  try {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      if (!token) {
        throw createHttpError(401, "No token provided")
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload

      // Get user from the token
      const user = await adminModel.findById(decoded.id).select("-password")

      // Assign user to request object
      ;(req as any).user = user

      return next()
    } else {
      throw createHttpError(401, "You are not Loggin, please Loggin")
    }
  } catch (error) {
    console.log("errorska", error)
    if (error.name === "JsonWebTokenError") {
      console.log("Invalid token", error)
      // return next(createHttpError(401, "Invalid token"))
      return next(createHttpError(401, "You are not Loggin, please Loggin"))
    } else {
      console.log("Error in protect middleware", error)
      return next(error)
    }
  }
}

const getAuthenticatedAdmin: RequestHandler = async (req, res, next) => {
  try {
    const authenticatedUserId = (req as any).user?.id

    if (!authenticatedUserId) {
      throw createHttpError(400, "User ID not found in request")
    }

    const authenticatedUser = await adminModel
      .findById(authenticatedUserId)
      .select("-password")

    if (!authenticatedUser) {
      throw createHttpError(404, "User not found")
    }

    res.json(authenticatedUser)
  } catch (error) {
    next(error)
  }
}

const createProduct: RequestHandler<
  unknown,
  unknown,
  CreateProductDT,
  unknown
> = async (req, res, next) => {
  const {
    productName,
    productPrice,
    productDescription,
    productImage,
    productStock,
  } = req.body

  if (!productName) {
    throw createHttpError(400, "Product name is missing.")
  }
  if (!productPrice) {
    throw createHttpError(400, "Product price is missing.")
  }
  if (!productDescription) {
    throw createHttpError(400, "Product description is missing.")
  }
  if (!productStock) {
    throw createHttpError(400, "Product stock is missing.")
  }

  try {
    // check if product already exists
    const product = await productModel
      .findOne({
        name: productName,
      })
      .exec()
    if (product) {
      throw createHttpError(409, "Product already exists.")
    }

    const newProduct = await productModel.create({
      name: productName,
      price: productPrice,
      description: productDescription,
      image: productImage,
      stock: productStock,
    })
    res.status(201).json(newProduct)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

const updateProduct: RequestHandler<
  updateProductParamsDT,
  unknown,
  UpdateProductDT,
  unknown
> = async (req, res, next) => {
  const productID = req.params.productID

  const {
    productName,
    productPrice,
    productDescription,
    productImage,
    productLikes,
    productStock,
  } = req.body

  try {
    const product = await productModel.findById(productID)
    if (!product) {
      throw createHttpError(404, "Product not found.")
    }

    product.name = productName
    product.price = productPrice
    product.description = productDescription
    product.image = productImage
    product.likes = productLikes
    product.stock = productStock

    const updatedProduct = await product.save()
    res.status(200).json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    next(error)
  }
}

const deleteProduct: RequestHandler<
  deleteProductParamsDT,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const productID = req.params.productID

  try {
    const product = await productModel.findById(productID)
    if (!product) {
      throw createHttpError(404, "Product not found.")
    }

    await product.deleteOne()
    await orderModel.updateMany(
      {
        product: productID,
      },
      { $set: { product: null } }
    )

    res.status(200).json({ message: "Success" })
  } catch (error) {
    next(error)
  }
}

const getProducts: RequestHandler = async (req, res, next) => {
  try {
    const products = await productModel.find().exec()

    res.status(200).json({ result: products.length, products })
  } catch (error) {
    next(error)
  }
}

const getOverviews: RequestHandler = async (req, res, next) => {
  try {
    // get all the products available
    const products = await productModel.find().exec()

    // get total number of products available
    const totalProducts = products.length

    // get total number of users
    const totalUsers = (await userModel.find().exec()).length

    // get total number of users that are joined or registered last month
    const lastMonthDate = new Date()
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    lastMonthDate.setDate(1)
    const newCustomers = await userModel.find({
      createdAt: { $gte: lastMonthDate },
    })

    // get all orders
    const orders = await orderModel.find().exec()
    const totalOrders = orders.length

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      newCustomers,
      products,
    })
  } catch (error) {
    next(error)
  }
}

export default {
  signup,
  login,
  protect,
  getAuthenticatedAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getOverviews,
}
