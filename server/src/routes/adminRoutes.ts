import express from "express"
import adminController from "../controllers/adminController"

const router = express.Router()
const { login, signup } = adminController

router.post("/", login)
router.post("/signup", signup)

export default router
