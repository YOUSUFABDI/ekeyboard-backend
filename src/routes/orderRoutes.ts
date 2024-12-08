import express from "express"
import orderController from "../controllers/orderController"
import authMiddleware from "../middlewares/authMiddleware"

const router = express.Router()

const { protect, restrictTo } = authMiddleware
const { makeOrder, getOrders, changeOrderStatus } = orderController

router.use(protect)

router.post("/make-order", makeOrder)
router.get("/get-orders", getOrders)

router.use(restrictTo("admin"))

router.patch("/change-status/:id", changeOrderStatus)
export default router
