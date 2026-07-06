import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { AppDataSource } from "../index"
import { User } from "../entity/User"

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "未提供认证令牌" })
  }

  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role?: string }
    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch {
    return res.status(401).json({ message: "无效或已过期的令牌" })
  }
}

export async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ message: "未认证" })
  }
  if (req.userRole === "admin") return next()

  try {
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOneBy({ id: req.userId })
    if (user?.role === "admin") {
      req.userRole = "admin"
      return next()
    }
    return res.status(403).json({ message: "需要管理员权限" })
  } catch {
    return res.status(500).json({ message: "服务器内部错误" })
  }
}
