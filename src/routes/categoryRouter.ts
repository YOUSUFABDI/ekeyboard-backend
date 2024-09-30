import express from "express"
import authMiddleware from "../middlewares/authMiddleware"
import categoryController from "../controllers/categoryController"

const router = express.Router()

const { protect, restrictTo } = authMiddleware
const { create, findAll, findOne, remove } = categoryController

router.use(protect)
router.use(restrictTo("admin"))

// category
router.get("/", findAll)
router.post("/create", create)
router.get("/:categoryId", findOne)
router.delete("/remove/:categoryId", remove)

export default router
