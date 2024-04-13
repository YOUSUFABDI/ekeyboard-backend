import express from "express"
import adminController from "../controllers/adminController"

const {
  signup,
  login,
  protect,
  getAuthenticatedAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getOverviews,
} = adminController

const router = express.Router()

router.post("/", login) // DONE✅
router.post("/signup", signup) // DONE✅
router.get("/me", protect, getAuthenticatedAdmin) // DONE✅
router.post("/create-product", protect, createProduct) // DONE✅
router.patch("/update-product/:productID", protect, updateProduct) // DONE✅
router.delete("/delete-product/:productID", protect, deleteProduct) // DONE✅
router.get("/get-products", protect, getProducts) // DONE✅
router.get("/get-overviews", protect, getOverviews) // DONE✅

export default router
