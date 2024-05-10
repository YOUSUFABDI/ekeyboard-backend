import { RequestHandler } from "express"
import createHttpError from "http-errors"
import {
  CreateProductDT,
  UpdateProductDT,
  deleteProductParamsDT,
  updateProductParamsDT,
} from "../lib/types/product"
import orderModel from "../models/orderModel"
import productModel from "../models/productModel"
import userModel from "../models/userModel"
import cloudinary from "../lib/util/cloudinary"

// Initialize Cloudinary
// cloudinary.config({
//   cloud_name: "dwik9lulf",
//   api_key: "466784638783261",
//   api_secret: "aJCCYt81L5DftVyKIRcHLirR4h4",
// })

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
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getOverviews,
}
