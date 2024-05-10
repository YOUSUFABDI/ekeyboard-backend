import { RequestHandler } from "express"
import { CustomRequestWithUser, MakeOrderBodyDT } from "lib/types/types"
import orderModel from "../models/orderModel"
import createHttpError from "http-errors"
import productModel from "../models/productModel"

const makeOrder: RequestHandler<
  unknown,
  unknown,
  MakeOrderBodyDT,
  unknown
> = async (req, res, next) => {
  try {
    const { quantity, productID } = req.body

    const product = await productModel.findById(productID)
    if (!product) {
      throw createHttpError(404, "Product not found.")
    }

    const authenticatedUserId = (req as CustomRequestWithUser).user?.id

    // before making order check the stock of the product
    if (product.stock < quantity) {
      throw createHttpError(400, "Not enough stock")
    }

    // update the product stock
    product.stock -= quantity
    await product.save()

    const order = await orderModel.create({
      user: authenticatedUserId,
      product: productID,
      quantity: quantity,
    })

    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
}

const getOrders: RequestHandler<unknown, unknown, unknown, unknown> = async (
  req,
  res,
  next
) => {
  try {
    // Populate user and product data for each order
    const orders = await orderModel
      .find()
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "product",
        match: { _id: { $ne: null } },
      })

    const filteredOrders = orders.filter((order) => order.product !== null)

    const allOrders =
      filteredOrders && filteredOrders.length < 1
        ? "There is no order yet"
        : filteredOrders

    res.status(200).json(allOrders)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export default { makeOrder, getOrders }
