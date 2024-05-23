import express from "express"
import productController from "../controllers/productController"
import authMiddleware from "../middlewares/authMiddleware"

const router = express.Router()

const { restrictTo, protect } = authMiddleware
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getOverviews,
  getProducts,
} = productController

router.use(protect)

router.post("/create-product", restrictTo("admin"), createProduct)
router.patch("/update-product/:productID", restrictTo("admin"), updateProduct)
router.delete("/delete-product/:productID", restrictTo("admin"), deleteProduct)
router.get("/get-products", getProducts)
router.get("/get-overviews", restrictTo("admin"), getOverviews)

export default router
