import { RequestHandler } from "express"
import createHttpError from "http-errors"
import prisma from "../../prisma/client"
import {
  CreateProductDT,
  UpdateProductDT,
  deleteMultipleProductsDT,
  removeProductParamsDT,
  updateProductParamsDT,
} from "../types/product"
import cloudinary from "../util/cloudinary"
import { CustomRequestWithUser } from "types/auth"

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
      productStock,
      categoryId,
    } = req.body

    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productStock ||
      !productImage ||
      !categoryId
    ) {
      throw createHttpError(400, "All fields are required")
    }

    // Upload images to Cloudinary and store both public_id and secure_url
    const uploadedImages = await Promise.all(
      productImage.map(async (image) => {
        const result = await cloudinary.uploader.upload(image, {
          folder: "Ekeyboard",
        })
        return { imageUrl: result.secure_url, public_id: result.public_id } // Include public_id
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
          create: uploadedImages, // Now includes both imageUrl and public_id
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
> = async (req, res, next) => {
  try {
    const { productId } = req.params
    if (!productId) {
      throw createHttpError(400, "Product ID is required.")
    }

    const {
      productName,
      productPrice,
      productDescription,
      productImage,
      productStock,
      categoryId,
    } = req.body

    // Validate all required fields
    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      productStock === undefined || // Allow 0 stock
      !productImage || // Assuming this is an array of strings
      !categoryId
    ) {
      throw createHttpError(400, "All fields are required")
    }

    // Fetch the existing product with images
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { images: true }, // Include the images relation
    })

    if (!existingProduct) {
      throw createHttpError(404, "Product not found.")
    }

    // If images are being updated, handle Cloudinary operations
    if (existingProduct.images && existingProduct.images.length > 0) {
      // Loop through existing images and delete from Cloudinary
      for (const oldImage of existingProduct.images) {
        await cloudinary.uploader.destroy(oldImage.public_id) // Use public_id for deletion
      }
    }

    // Upload new images to Cloudinary
    const uploadedImages = await Promise.all(
      productImage.map(async (imageUrl: string) => {
        const result = await cloudinary.uploader.upload(imageUrl, {
          folder: "Ekeyboard",
        })
        return {
          imageUrl: result.secure_url,
          public_id: result.public_id, // Include public_id in the new images
        }
      })
    )

    // Update product details in the database
    const updatedProduct = await prisma.product.update({
      where: {
        id: Number(productId),
      },
      data: {
        name: productName,
        price: productPrice,
        description: productDescription,
        stock: productStock,
        categoryId: categoryId,
        images: {
          deleteMany: {}, // Delete all old images for the product
          create: uploadedImages, // Include both imageUrl and public_id
        },
      },
    })

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      payload: updatedProduct,
    })
  } catch (error) {
    next(error)
  }
}

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

    // Fetch the product including its images
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { images: true }, // Fetch images related to the product
    })

    if (!product) {
      throw createHttpError(404, "Product not found")
    }

    // Delete the images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (image) => {
          try {
            await cloudinary.uploader.destroy(image.public_id) // Correctly use public_id
          } catch (error) {
            console.error(`Failed to delete image ${image.public_id}:`, error)
          }
        })
      )
    }

    // Delete the product from the database
    await prisma.product.delete({
      where: { id: Number(productId) },
    })

    res.success("Product and associated images deleted successfully")
  } catch (error) {
    next(error)
  }
}

const deleteMultipleProducts: RequestHandler<
  unknown,
  unknown,
  deleteMultipleProductsDT,
  unknown
> = async (req, res, next) => {
  try {
    const { productIds } = req.body

    // Validate the input
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw createHttpError(400, "Please provide a valid array of product IDs.")
    }

    // Fetch product images' public_ids from the database
    const productImages = await prisma.productImages.findMany({
      where: {
        productId: { in: productIds },
      },
      select: {
        public_id: true, // Select only the public_id field
      },
    })

    if (productImages.length > 0) {
      // Delete product images from Cloudinary
      await Promise.all(
        productImages.map(async (image) => {
          try {
            await cloudinary.uploader.destroy(image.public_id) // Correctly use public_id
          } catch (error) {
            console.error(`Failed to delete image ${image.public_id}:`, error)
          }
        })
      )
    }

    // Delete the products and their associated records from the database
    await prisma.productImages.deleteMany({
      where: { productId: { in: productIds } },
    })

    const deletedProducts = await prisma.product.deleteMany({
      where: {
        id: { in: productIds },
      },
    })

    if (deletedProducts.count === 0) {
      throw createHttpError(404, "No products were deleted.")
    }

    // Respond with success
    res.success(
      "Products and their images were deleted successfully.",
      deletedProducts.count
    )
  } catch (error) {
    next(error)
  }
}

const toggleLikeProduct: RequestHandler<
  { id: string },
  unknown,
  unknown,
  unknown
> = async (req: CustomRequestWithUser, res, next): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId || typeof userId !== "number") {
      throw createHttpError(401, "User not authenticated")
    }

    const { id } = req.params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) {
      throw createHttpError(404, "Invalid Product ID")
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })
    if (!product) {
      throw createHttpError(404, "Product not found")
    }

    const existingLike = await prisma.productLike.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    let message = ""
    if (existingLike) {
      // Unlike the product
      await prisma.productLike.delete({
        where: { id: existingLike.id },
      })

      // Decrement the likes count in the product table
      await prisma.product.update({
        where: { id: productId },
        data: { likes: { decrement: 1 } },
      })

      message = "Product unliked successfully"
    } else {
      // Like the product
      await prisma.productLike.create({
        data: { userId, productId },
      })

      // Increment the likes count in the product table
      await prisma.product.update({
        where: { id: productId },
        data: { likes: { increment: 1 } },
      })

      message = "Product liked successfully"
    }

    res.success(message)
  } catch (error) {
    next(error)
  }
}

const Overview: RequestHandler = async (req, res, next) => {}

export default {
  create,
  update,
  remove,
  deleteMultipleProducts,
  findAll,
  findOne,
  toggleLikeProduct,

  Overview,
}
