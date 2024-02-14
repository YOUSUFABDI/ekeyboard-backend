import authController from "../controllers/authController"
import express from "express"

const router = express.Router()

const { signUp, login, getAuthenticatedUser } = authController

router.get("/", login)
router.post("/signup", signUp)
router.post("/me", getAuthenticatedUser)

export default router
