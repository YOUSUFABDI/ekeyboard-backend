import express from "express"
import orderController from "../controllers/orderController"
import authController from "../controllers/authController"

const router = express.Router()

const { makeOrder } = orderController
const { protect } = authController

router.post("/make-order", protect, makeOrder)

export default router
