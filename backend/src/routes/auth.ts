import { Router } from "express"
import { authMiddleware } from "../middleware/auth"
import { sendCode, verifyRegister, login, getMe } from "../controllers/authController"

const router = Router()

router.post("/send-code", sendCode)
router.post("/verify-register", verifyRegister)
router.post("/login", login)
router.get("/me", authMiddleware, getMe)

export default router
