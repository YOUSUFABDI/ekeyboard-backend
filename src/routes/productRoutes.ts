import express from "express"
import productController from "../controllers/productController"
import authMiddleware from "../middlewares/authMiddleware"

const router = express.Router()

const { restrictTo, protect } = authMiddleware

const {
  findAll,
  findOne,
  create,
  update,
  remove,
  deleteMultipleProducts,
  toggleLikeProduct,

  Overview,
} = productController

router.use(protect)

router.get("/", findAll)
router.get("/:productId", findOne)
router.post("/like/:id", toggleLikeProduct)

router.use(restrictTo("admin"))

router.post("/create", create)
router.patch("/update/:productId", update)
router.delete("/remove/:productId", remove)
router.delete("/remove-many", deleteMultipleProducts)

router.get("/get-overviews", Overview)

export default router
