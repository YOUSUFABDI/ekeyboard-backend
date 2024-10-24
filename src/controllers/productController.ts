import { RequestHandler } from "express";
import createHttpError from "http-errors";
import prisma from "../../prisma/client";
import {
  CreateProductDT,
  UpdateProductDT,
  removeProductParamsDT,
  updateProductParamsDT,
} from "../types/product";
import cloudinary from "../util/cloudinary";

const findAll: RequestHandler = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
      },
    });
    res.success("", products);
  } catch (error) {
    next(error);
  }
};

const findOne: RequestHandler<
  { productId: number },
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw createHttpError(404, "ProductId is required");
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: {
        images: true,
        category: true,
      },
    });
    if (!product) {
      throw createHttpError(404, "Product not found");
    }

    res.success("", product);
  } catch (error) {
    next(error);
  }
};

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
    } = req.body;

    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productStock ||
      !productImage ||
      !categoryId
    ) {
      throw createHttpError(400, "All fields are required");
    }

    // Check if images are URLs or base64 and upload accordingly
    const uploadedImages = await Promise.all(
      productImage.map(async (image) => {
        if (image.startsWith("http")) {
          // Handle as URL
          const result = await cloudinary.uploader.upload(image, {
            // You can specify more options here if needed
          });
          return { imageUrl: result.secure_url };
        } else {
          // Handle as base64 data
          const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
          const result = await cloudinary.uploader.upload(
            `data:image/png;base64,${base64Data}`
          );
          return { imageUrl: result.secure_url };
        }
      })
    );

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
    });

    res.success("Product created successfully", product);
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler<
  updateProductParamsDT,
  unknown,
  UpdateProductDT,
  unknown
> = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw createHttpError(400, "Product ID is required.");
    }

    const {
      productName,
      productPrice,
      productDescription,
      productImage,
      productStock,
      categoryId,
    } = req.body;

    // Validate all required fields
    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      productStock === undefined || // Allow 0 stock
      !productImage || // Assuming this is an array of strings
      !categoryId
    ) {
      throw createHttpError(400, "All fields are required");
    }

    // Fetch the existing product with images
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { images: true }, // Include the images relation
    });

    if (!existingProduct) {
      throw createHttpError(404, "Product not found.");
    }

    // If images are being updated, handle Cloudinary operations
    if (existingProduct.images && existingProduct.images.length > 0) {
      // Loop through existing images and delete from Cloudinary
      for (const oldImage of existingProduct.images) {
        // Assume oldImage has a public_id to delete
        await cloudinary.uploader.destroy(oldImage.id); // Adjust this line based on your structure
      }
    }

    // Upload new images to Cloudinary
    const uploadedImages = await Promise.all(
      productImage.map(async (imageUrl: string) => {
        const result = await cloudinary.uploader.upload(imageUrl);
        return {
          productId: Number(productId), // Associate with the current product
          imageUrl: result.secure_url, // Save URL of the uploaded image
        };
      })
    );

    // Update product details in the database
    const updatedProduct = await prisma.product.update({
      where: { id: Number(productId) },
      data: {
        name: productName,
        price: productPrice,
        description: productDescription,
        stock: productStock,
        categoryId: categoryId,
        images: {
          deleteMany: {}, // This will delete the old images
          create: uploadedImages, // Create new image records
        },
      },
    });

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      payload: updatedProduct,
    });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};

const remove: RequestHandler<
  removeProductParamsDT,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw createHttpError(404, "ProductId is required");
    }

    await prisma.product.delete({
      where: { id: Number(productId) },
    });

    res.success("Product deleted successfully");
  } catch (error) {
    next(error);
  }
};

const Overview: RequestHandler = async (req, res, next) => {};

export default {
  create,
  update,
  remove,
  findAll,
  findOne,

  Overview,
};
