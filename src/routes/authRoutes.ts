import express from "express"
import authController from "../controllers/authController"
import authMiddleware from "../middlewares/authMiddleware"

const router = express.Router()

const { restrictTo, protect } = authMiddleware
const {
  signUp,
  verifyOtpCode,
  login,
  getAuthenticatedUser,
  updateAdminInfo,
  updatePassword,
} = authController

router.post("/", login)
router.post("/signup", signUp)
router.post("/verfiy-otp", verifyOtpCode)
router.get("/me", protect, getAuthenticatedUser)
router.put("/update-password", protect, updatePassword)

// for admin users only
// router.use(restrictTo("admin"))

router.put("/update-admin-info", protect, updateAdminInfo)
// router.get("/delete-user", protect, deleteUser)

export default router
