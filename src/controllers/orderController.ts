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
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdDT: "desc",
      },
    })

    res.success("", orders)
  } catch (error) {
    next(error)
  }
}

const changeOrderStatus: RequestHandler<
  { id: string },
  unknown,
  { status: string },
  unknown
> = async (req: CustomRequestWithUser, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ["pending", "delivered", "completed"]
    if (!validStatuses.includes(status)) {
      throw createHttpError(
        400,
        `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id, 10) },
    })
    if (!order) {
      throw createHttpError(404, `Order not found`)
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    })

    res.success(`Order status updated to ${status}`, updatedOrder)
  } catch (error) {
    next(error)
  }
}

const getOrderHistory: RequestHandler = async (
  req: CustomRequestWithUser,
  res,
  next
) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw createHttpError(401, `Unauthorized`)
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdDT: "desc",
      },
    })

    const formattedOrders = orders.map((order) => ({
      orderId: order.id,
      productName: order.product.name,
      quantity: order.quantity,
      price: order.product.price,
      status: order.status,
      createdDate: order.createdDT,
    }))

    res.success("", formattedOrders)
  } catch (error) {
    console.error("Error fetching order history:", error)
    next(error)
  }
}

export default { makeOrder, getOrders, changeOrderStatus, getOrderHistory }
