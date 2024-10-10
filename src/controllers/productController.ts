import { RequestHandler } from "express"
import createHttpError from "http-errors"
import prisma from "../../prisma/client"
import {
  CreateProductDT,
  UpdateProductDT,
  removeProductParamsDT,
  updateProductParamsDT,
} from "../types/product"
import cloudinary from "../util/cloudinary"

const findAll: RequestHandler = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
      },
    })
    res.success("", products)
  } catch (error) {
    next(error)
  }
}

const findOne: RequestHandler<
  { productId: number },
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { productId } = req.params
    if (!productId) {
      throw createHttpError(404, "ProductId is required")
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: {
        images: true,
        category: true,
      },
    })
    if (!product) {
      throw createHttpError(404, "Product not found")
    }

    res.success("", product)
  } catch (error) {
    next(error)
  }
}

const create: RequestHandler<
  unknown,
  unknown,
  CreateProductDT,
  unknown
> = async (req, res, next) => {
  try {
    const {
      productName,
      productPrice,
      productDescription,
      productImage,
      // productLikes,
      productStock,
      categoryId,
    } = req.body
    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productStock ||
      // !productImage ||
      !categoryId
    ) {
      throw createHttpError(400, "All fields are required")
    }

    const uploadedImages = await Promise.all(
      productImage.map(async (image) => {
        const result = await cloudinary.uploader.upload(image)
        return { imageUrl: result.secure_url }
      })
    )

    const product = await prisma.product.create({
      data: {
        name: productName,
        price: productPrice,
        description: productDescription,
        likes: 0,
        stock: productStock,
        category: {
          connect: { id: categoryId },
        },
        images: {
          create: uploadedImages,
        },
      },
    })

    res.success("Product created successfully", product)
  } catch (error) {
    next(error)
  }
}

const update: RequestHandler<
  updateProductParamsDT,
  unknown,
  UpdateProductDT,
  unknown
> = async (req, res, next) => {}

const remove: RequestHandler<
  removeProductParamsDT,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { productId } = req.params
    if (!productId) {
      throw createHttpError(404, "ProductId is required")
    }

    await prisma.product.delete({
      where: { id: Number(productId) },
    })

    res.success("Product deleted successfully")
  } catch (error) {
    next(error)
  }
}

const Overview: RequestHandler = async (req, res, next) => {}

export default {
  create,
  update,
  remove,
  findAll,
  findOne,

  Overview,
}
