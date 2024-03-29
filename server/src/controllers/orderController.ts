import { RequestHandler } from "express"
import { CustomRequestWithUser } from "lib/types"
import orderModel from "../models/orderModel"
import createHttpError from "http-errors"
import productModel from "../models/productModel"

type MakeOrderBodyDT = {
  quantity: number
  productID: string
}

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

export default { makeOrder }
