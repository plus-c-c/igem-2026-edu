import { Response } from "express"
import jwt, { type SignOptions } from "jsonwebtoken"
import { AppDataSource } from "../index"
import { User } from "../entity/User"
import { AuthRequest } from "../middleware/auth"
import { sendVerificationCode, storeVerificationData, verifyCode } from "../email"

export async function sendCode(req: AuthRequest, res: Response) {
  try {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
      return res.status(400).json({ message: "请提供邮箱、团队名称和密码" })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "密码至少 6 位" })
    }

    const userRepo = AppDataSource.getRepository(User)
    const existingUser = await userRepo.findOneBy({ email })
    if (existingUser) {
      return res.status(409).json({ message: "该邮箱已被注册" })
    }

    storeVerificationData(email, { email, password, name })
    await sendVerificationCode(email)
    return res.json({ message: "验证码已发送到您的邮箱" })
  } catch (error: any) {
    console.error("发送验证码错误:", error)
    return res.status(400).json({ message: error.message || "发送验证码失败" })
  }
}

export async function verifyRegister(req: AuthRequest, res: Response) {
  try {
    const { email, code } = req.body
    if (!email || !code) {
      return res.status(400).json({ message: "请提供邮箱和验证码" })
    }

    const result = verifyCode(email, code)
    if (!result.valid || !result.data) {
      return res.status(400).json({ message: "验证码错误或已过期" })
    }

    const { password, name } = result.data
    const userRepo = AppDataSource.getRepository(User)
    const user = userRepo.create({ email, password, name })
    await userRepo.save(user)

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as SignOptions
    )

    return res.status(201).json({
      message: "注册成功",
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (error) {
    console.error("注册错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function login(req: AuthRequest, res: Response) {
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
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as SignOptions
    )

    return res.json({
      message: "登录成功",
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (error) {
    console.error("登录错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOneBy({ id: req.userId })
    if (!user) {
      return res.status(404).json({ message: "用户不存在" })
    }

    return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (error) {
    console.error("获取用户信息错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}
