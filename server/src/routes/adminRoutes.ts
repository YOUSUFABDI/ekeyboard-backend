import express from "express"
import adminController from "../controllers/adminController"

const {
  signup,
  login,
  getMe,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getOverviews,
} = adminController

const router = express.Router()

router.post("/", login)
router.post("/signup", signup)
router.get("/me/:username", getMe)
router.post("/create-product", createProduct)
router.delete("/delete-product/:productID", deleteProduct)
router.patch("/update-product/:productID", updateProduct)
router.get("/get-products", getProducts)
router.get("/get-overviews", getOverviews)
// why
export default router
