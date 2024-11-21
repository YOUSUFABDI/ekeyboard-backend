import { RequestHandler } from "express"
import createHttpError from "http-errors"
import prisma from "../../prisma/client"
import { MakeOrderBodyDT } from "../types/order"
import { CustomRequestWithUser } from "types/auth"

const makeOrder: RequestHandler<
  unknown,
  unknown,
  MakeOrderBodyDT,
  unknown
> = async (req: CustomRequestWithUser, res, next) => {
  try {
    const userId = req.user.id

    const { quantity, productID } = req.body
    if (!quantity || !productID || !userId) {
      throw createHttpError(400, "All fields are required.")
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productID) },
    })
    if (!product) {
      throw createHttpError(404, "Product  not found.")
    }
    if (product.stock < quantity) {
      throw createHttpError(
        404,
        `Insufficient stock. Only ${product.stock} items left.`
      )
    }

    const order = await prisma.order.create({
      data: {
        userId: Number(userId),
        productId: product.id,
        quantity,
      },
    })

    await prisma.product.update({
      where: { id: product.id },
      data: { stock: product.stock - quantity },
    })

    res.success("Ordered successfully.", order)
  } catch (error) {
    next(error)
  }
}

const getOrders: RequestHandler = async (
  req: CustomRequestWithUser,
  res,
  next
) => {
  try {
    const userId = req.user.id

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        product: true,
      },
    })

    res.success("", orders)
  } catch (error) {
    next(error)
  }
}

export default { makeOrder, getOrders }
