import { RequestHandler } from "express"
import { MakeOrderBodyDT } from "../types/order"
import { CustomRequestWithUser } from "../types/auth"

const makeOrder: RequestHandler<
  unknown,
  unknown,
  MakeOrderBodyDT,
  unknown
> = async (req, res, next) => {}

const getOrders: RequestHandler<unknown, unknown, unknown, unknown> = async (
  req,
  res,
  next
) => {}

export default { makeOrder, getOrders }
