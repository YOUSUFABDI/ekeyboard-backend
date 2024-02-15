import authController from "../controllers/authController"
import express from "express"

const router = express.Router()

const { signUp, login, getAuthenticatedUser, protect } = authController
// const { protect } = require("../middleware/authMiddleware")

router.post("/", login)
router.post("/signup", signUp)
router.get("/me", protect, getAuthenticatedUser)

export default router
