import { RequestHandler } from "express"
import createHttpError from "http-errors"
import adminModel from "../models/adminModel"
import {
  CreateProductDT,
  LoginBodyDT,
  UpdateProductDT,
  signupBodyDT,
} from "lib/types"
import productModel from "../models/productModel"

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
> = async (req, res, next) => {
  const { productName, productPrice, productDescription, productImage,productLikes,productStock } = req.body

  if (!productName || !productPrice || !productDescription || !productImage || !productLikes || !productStock) {
    throw createHttpError(400, "Parameters missing")
  }

  try {
    const newProduct = await productModel.create({
      name:productName,
      price:productPrice,
      description:productDescription,
      image:productImage,
      likes:productLikes,
      stock:productStock
    })
    console.log("waa new product",newProduct)
    res.status(201).json(newProduct)
  } catch (error) {
    console.log(error)
    next(error)
    
  }
}







const updateProduct: RequestHandler<{ productID: number }, unknown, UpdateProductDT, unknown> = async (req, res, next) => {
  const { productID } = req.params;
  const { productName, productPrice, productDescription, productImage, productLikes, productStock } = req.body;
  console.log("i am in update product",req.body,req.params)

  // Check if productID is provided
  if (!productID) {
    return res.status(400).json({ error: "Product ID is missing" });
  }

  try {
    // Find the product by ID
    const product = await productModel.findById(productID);

    // If product doesn't exist, return 404 Not Found
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update product fields if provided in the request body
    if (productName) product.name = productName;
    if (productPrice) product.price = productPrice;
    if (productDescription) product.description = productDescription;
    if (productImage) product.image = productImage;
    if (productLikes) product.likes = productLikes;
    if (productStock) product.stock = productStock;

    // Save the updated product
    const updatedProduct = await product.save();
    console.log("updated data waye", updatedProduct);

    // Respond with the updated product
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    next(error);
  }
};

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
