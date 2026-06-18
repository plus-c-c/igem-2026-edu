import { Router, Response } from "express"
import jwt from "jsonwebtoken"
import { AppDataSource } from "../index"
import { User } from "../entity/User"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.post("/register", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ message: "请提供邮箱、密码和姓名" })
    }

    const userRepo = AppDataSource.getRepository(User)
    const existingUser = await userRepo.findOneBy({ email })
    if (existingUser) {
      return res.status(409).json({ message: "该邮箱已被注册" })
    }

    const user = userRepo.create({ email, password, name })
    await userRepo.save(user)

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" as any }
    )

    return res.status(201).json({
      message: "注册成功",
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    console.error("注册错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "请提供邮箱和密码" })
    }

    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOneBy({ email })
    if (!user) {
      return res.status(401).json({ message: "邮箱或密码错误" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "邮箱或密码错误" })
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" as any }
    )

    return res.json({
      message: "登录成功",
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    console.error("登录错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOneBy({ id: req.userId })
    if (!user) {
      return res.status(404).json({ message: "用户不存在" })
    }

    return res.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    console.error("获取用户信息错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

export default router
