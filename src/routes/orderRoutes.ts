import express from "express"
import orderController from "../controllers/orderController"
import authMiddleware from "../middlewares/authMiddleware"

const router = express.Router()

const { protect } = authMiddleware
const { makeOrder, getOrders } = orderController

router.post("/make-order", protect, makeOrder)
router.get("/get-orders", protect, getOrders)

export default router
