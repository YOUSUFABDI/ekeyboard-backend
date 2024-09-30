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

  Overview,
} = productController

router.use(protect)

router.get("/", findAll)
router.get("/:productId", findOne)

router.use(restrictTo("admin"))

router.post("/create", create)
router.patch("/update/:productId", update)
router.delete("/remove/:productId", remove)

router.get("/get-overviews", Overview)

export default router
