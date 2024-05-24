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
    const product = await productModel
      .findOne({
        name: productName,
      })
      .exec()
    if (product) {
      throw createHttpError(409, "Product already exists.")
    }

    let imageUrls: string[] = [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaBqXPJxDAvLfz-d0uNwJtxUSGKexAZfWzkknNlUdU0A&s",
    ]

    if (Array.isArray(productImage)) {
      imageUrls = await Promise.all(
        productImage.map(async (image) => {
          if (typeof image === "string") {
            const uploadResult = await cloudinary.uploader.upload(image, {
              folder: "Ekeyboard",
              use_filename: true,
            })
            return uploadResult.secure_url
          }
          return imageUrls[0]
        })
      )
    } else if (typeof productImage === "string") {
      const uploadResult = await cloudinary.uploader.upload(productImage, {
        folder: "Ekeyboard",
        use_filename: true,
      })
      imageUrls = [uploadResult.secure_url]
    }

    const newProduct = await productModel.create({
      name: productName,
      price: productPrice,
      description: productDescription,
      images: imageUrls,
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

    const currentImageUrls = product.images
    const deletePromises = currentImageUrls.map(async (url) => {
      const publicID = url.split("/").pop()?.split(".")[0]
      if (publicID) {
        await cloudinary.uploader.destroy(`Ekeyboard/${publicID}`)
      }
    })
    await Promise.all(deletePromises)

    let imageUrls: string[] = []
    if (Array.isArray(productImage)) {
      imageUrls = await Promise.all(
        productImage.map(async (image) => {
          if (typeof image === "string") {
            const uploadResult = await cloudinary.uploader.upload(image, {
              folder: "Ekeyboard",
              use_filename: true,
            })
            return uploadResult.secure_url
          }
          return ""
        })
      )
    } else if (typeof productImage === "string") {
      const uploadResult = await cloudinary.uploader.upload(productImage, {
        folder: "Ekeyboard",
        use_filename: true,
      })
      imageUrls = [uploadResult.secure_url]
    }

    imageUrls = imageUrls.filter((url) => url)

    product.name = productName
    product.price = productPrice
    product.description = productDescription
    product.images = imageUrls
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

    const deletePromises = product.images.map(async (url) => {
      const publicID = url.split("/")?.pop()?.split(".")[0]
      if (publicID) {
        await cloudinary.uploader.destroy(`Ekeyboard/${publicID}`)
      }
    })
    await Promise.all(deletePromises)

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
