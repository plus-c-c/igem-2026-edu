import crypto from "crypto"
import nodemailer from "nodemailer"

export interface PendingRegistration {
  email: string
  password: string
  name: string
  registrantName?: string
  igemRole?: string
  avatar?: string
}

const codes = new Map<string, { code: string; data: PendingRegistration; expires: number }>()

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.qq.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  } as nodemailer.TransportOptions)
}

export function sendVerificationCode(email: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const existing = codes.get(email)
    if (existing && existing.expires > Date.now()) {
      const remaining = Math.ceil((existing.expires - Date.now()) / 1000)
      reject(new Error(`验证码已发送，请 ${remaining} 秒后再试`))
      return
    }

    const code = crypto.randomInt(100000, 999999).toString()
    codes.set(email, {
      code,
      data: { email, password: "", name: "" },
      expires: Date.now() + 5 * 60 * 1000,
    })

    const transporter = createTransporter()
    transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "HP-Education 联盟 - 注册验证码",
      text: `您的注册验证码是：${code}\n\n验证码有效期为 5 分钟。`,
      html: `<p>您的注册验证码是：<strong>${code}</strong></p><p>验证码有效期为 5 分钟。</p>`,
    }).then(() => resolve(code)).catch((err) => {
      codes.delete(email)
      console.error("SMTP 发送错误:", err)
      reject(new Error("邮件发送失败，请检查邮箱地址或稍后重试"))
    })
  })
}

export function storeVerificationData(email: string, data: PendingRegistration) {
  const existing = codes.get(email)
  if (existing) {
    existing.data = data
    codes.set(email, existing)
  }
}

export function verifyCode(email: string, code: string): { valid: boolean; data?: PendingRegistration } {
  const entry = codes.get(email)
  if (!entry) return { valid: false }
  if (entry.expires < Date.now()) {
    codes.delete(email)
    return { valid: false }
  }
  if (entry.code !== code) return { valid: false }
  codes.delete(email)
  return { valid: true, data: entry.data }
}
