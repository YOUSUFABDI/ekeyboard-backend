import { RequestHandler } from "express"
import { MakeOrderBodyDT } from "../lib/types/order"
import { CustomRequestWithUser } from "../lib/types/auth"

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
