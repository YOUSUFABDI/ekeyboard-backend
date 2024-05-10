import authController from "../controllers/authController"
import express from "express"

const router = express.Router()

const { signUp, login, getAuthenticatedUser, protect, restrictTo } =
  authController

router.post("/", login)
router.post("/signup", signUp)
router.get("/me", protect, getAuthenticatedUser)

router.use(restrictTo("admin"))

// router.get("/delete-user", protect, deleteUser)

export default router
