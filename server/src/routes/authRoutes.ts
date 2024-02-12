import authController from "../controllers/authController"
import express from "express"

const router = express.Router()

const { signUp, login } = authController

router.get("/", login)
router.post("/signup", signUp)

export default router
