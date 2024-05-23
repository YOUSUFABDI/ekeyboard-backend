import express from "express"
import orderController from "../controllers/orderController"
import authMiddleware from "../middlewares/authMiddleware"

const router = express.Router()

const { protect } = authMiddleware
const { makeOrder, getOrders } = orderController

router.use(protect)

router.post("/make-order", makeOrder)
router.get("/get-orders", getOrders)

export default router
