import { Router } from "express"
import { authMiddleware } from "../middleware/auth"
import { sendCode, verifyRegister, login, getMe, updateMe, changePassword, sendPasswordReset, resetPassword, debugGetCode } from "../controllers/authController"

const router = Router()

router.post("/send-code", sendCode)
router.post("/verify-register", verifyRegister)
router.post("/login", login)
router.get("/me", authMiddleware, getMe)
router.put("/me", authMiddleware, updateMe)
router.post("/change-password", authMiddleware, changePassword)
router.post("/send-password-reset-code", sendPasswordReset)
router.post("/reset-password", resetPassword)
router.get("/debug-code/:email", debugGetCode)

export default router
