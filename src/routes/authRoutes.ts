import express from "express"
import authController from "../controllers/authController"
import authMiddleware from "../middlewares/authMiddleware"

const router = express.Router()

const { restrictTo, protect } = authMiddleware
const { signUp, login, getAuthenticatedUser } = authController

router.post("/", login)
router.post("/signup", signUp)
router.get("/me", protect, getAuthenticatedUser)

router.use(restrictTo("admin"))

// router.get("/delete-user", protect, deleteUser)

export default router
