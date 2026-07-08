import { Router } from "express"
import { authMiddleware } from "../middleware/auth"
import { sendCode, verifyRegister, login, getMe, updateMe, changePassword } from "../controllers/authController"

const router = Router()

router.post("/send-code", sendCode)
router.post("/verify-register", verifyRegister)
router.post("/login", login)
router.get("/me", authMiddleware, getMe)
router.put("/me", authMiddleware, updateMe)
router.post("/change-password", authMiddleware, changePassword)

export default router
