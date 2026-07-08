import { Response } from "express"
import jwt, { type SignOptions } from "jsonwebtoken"
import bcrypt from "bcrypt"
import { AppDataSource } from "../index"
import { User } from "../entity/User"
import { AuthRequest } from "../middleware/auth"
import { sendVerificationCode, storeVerificationData, verifyCode } from "../email"

function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    registrantName: user.registrantName,
    igemRole: user.igemRole,
    avatar: user.avatar || "/images/logo.jpg",
  }
}

export async function sendCode(req: AuthRequest, res: Response) {
  try {
    const { email, name, password, registrantName, igemRole, avatar } = req.body
    if (!email || !name || !password || !registrantName || !igemRole) {
      return res.status(400).json({ message: "请提供邮箱、团队名称、注册人姓名、iGEM 职位和密码" })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "密码至少 6 位" })
    }

    const userRepo = AppDataSource.getRepository(User)
    const existingUser = await userRepo.findOneBy({ email })
    if (existingUser) {
      return res.status(409).json({ message: "该邮箱已被注册" })
    }

    await sendVerificationCode(email)
    storeVerificationData(email, {
      email,
      password,
      name,
      registrantName,
      igemRole,
      avatar: avatar || "/images/logo.jpg",
    })
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

    const { password, name, registrantName, igemRole, avatar } = result.data
    const userRepo = AppDataSource.getRepository(User)
    const user = userRepo.create({
      email,
      password,
      name,
      registrantName,
      igemRole,
      avatar: avatar || "/images/logo.jpg",
    })
    await userRepo.save(user)

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as SignOptions
    )

    return res.status(201).json({
      message: "注册成功",
      token,
      user: serializeUser(user),
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
      user: serializeUser(user),
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

    return res.json({ user: serializeUser(user) })
  } catch (error) {
    console.error("获取用户信息错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function updateMe(req: AuthRequest, res: Response) {
  try {
    const { name, registrantName, igemRole, avatar } = req.body
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOneBy({ id: req.userId })
    if (!user) {
      return res.status(404).json({ message: "用户不存在" })
    }

    if (name !== undefined) user.name = name
    if (registrantName !== undefined) user.registrantName = registrantName
    if (igemRole !== undefined) user.igemRole = igemRole
    if (avatar !== undefined) user.avatar = avatar

    await userRepo.save(user)
    return res.json({ user: serializeUser(user), message: "更新成功" })
  } catch (error) {
    console.error("更新用户信息错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "请提供当前密码和新密码" })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "新密码至少 6 位" })
    }

    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOneBy({ id: req.userId })
    if (!user) {
      return res.status(404).json({ message: "用户不存在" })
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: "当前密码错误" })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await userRepo.save(user)
    return res.json({ message: "密码修改成功" })
  } catch (error) {
    console.error("修改密码错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}
