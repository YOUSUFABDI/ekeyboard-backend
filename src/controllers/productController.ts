import { RequestHandler } from "express"
import {
  CreateCategoryDT,
  CreateProductDT,
  UpdateProductDT,
  deleteProductParamsDT,
  updateProductParamsDT,
} from "../lib/types/product"
import prisma from "../../prisma/client"
import createHttpError from "http-errors"
import cloudinary from "../lib/util/cloudinary"

const createCategory: RequestHandler<
  unknown,
  unknown,
  CreateCategoryDT,
  unknown
> = async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name) {
      throw createHttpError(400, "name is required")
    }

    const category = await prisma.productCategory.create({
      data: {
        name,
      },
    })

    res.success("Product created successfully", category)
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
  try {
    const {
      productName,
      productPrice,
      productDescription,
      productImage,
      productLikes,
      productStock,
      categoryId,
    } = req.body
    if (
      !productName ||
      !productDescription ||
      !productImage ||
      !productLikes ||
      !productPrice ||
      !productStock ||
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
        likes: productLikes,
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

const updateProduct: RequestHandler<
  updateProductParamsDT,
  unknown,
  UpdateProductDT,
  unknown
> = async (req, res, next) => {}

const deleteProduct: RequestHandler<
  deleteProductParamsDT,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {}

const getProducts: RequestHandler = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany()
    res.success("", products)
  } catch (error) {
    next(error)
  }
}

const getOverviews: RequestHandler = async (req, res, next) => {}

export default {
  createCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getOverviews,
}
