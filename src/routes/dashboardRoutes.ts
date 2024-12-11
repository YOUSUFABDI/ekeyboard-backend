import express from "express"
import dashboardController from "../controllers/dashboardController"
import authMiddleware from "../middlewares/authMiddleware"

const router = express.Router()

const { restrictTo, protect } = authMiddleware

const { getTopSellingProducts, recentOrders, getSummary } = dashboardController

router.use(protect)
router.use(restrictTo("admin"))

router.get("/top-selling", getTopSellingProducts)
router.get("/recent-orders", recentOrders)
router.get("/summary", getSummary)

export default router
