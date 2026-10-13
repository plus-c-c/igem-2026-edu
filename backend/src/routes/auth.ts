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

// 安全: debug-code 没有任何鉴权, 却能读出某邮箱待用的注册/重置验证码。
// 配合 send-password-reset-code, 攻击者可以对任意账号「申请重置 -> 读码 -> 改密」,
// 直接接管账号。因此默认不注册这条路由, 只在本机调试/自动化测试时显式开启:
//   ENABLE_AUTH_DEBUG_ROUTES=true
// 切勿在公网环境设置该变量。
if (process.env.ENABLE_AUTH_DEBUG_ROUTES === "true") {
  console.warn("[安全警告] ENABLE_AUTH_DEBUG_ROUTES=true, 已启用无鉴权的 /api/auth/debug-code, 请勿用于公网环境")
  router.get("/debug-code/:email", debugGetCode)
}

export default router
