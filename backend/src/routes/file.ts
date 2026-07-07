import { Router, Response } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { AppDataSource } from "../index"
import { UploadedFile } from "../entity/File"
import { Resource } from "../entity/Resource"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const UPLOAD_DIR = path.resolve(__dirname, "../../uploads")
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${unique}${ext}`)
  },
})

const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 1024 } })
const router = Router()

router.get("/files/:fileId/download", async (req, res: Response) => {
  try {
    const fileRepo = AppDataSource.getRepository(UploadedFile)
    const record = await fileRepo.findOneBy({ id: req.params.fileId as string })
    if (!record) return res.status(404).json({ message: "文件不存在" })

    const filePath = path.resolve(UPLOAD_DIR, record.storedName)
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "文件已丢失" })

    const isImage = record.mimeType?.startsWith("image/")
    res.setHeader("Content-Disposition", `${isImage ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(record.originalName)}`)
    res.setHeader("Content-Type", record.mimeType)
    res.sendFile(filePath)
  } catch (error) {
    console.error("文件下载错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

router.post("/:resourceId/files", authMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    const resourceRepo = AppDataSource.getRepository(Resource)
    const resourceId = req.params.resourceId as string
    const resource = await resourceRepo.findOneBy({ id: resourceId })
    if (!resource) return res.status(404).json({ message: "资源不存在" })
    if (resource.userId !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "无权限上传文件" })
    }

    const file = req.file
    if (!file) return res.status(400).json({ message: "请选择文件" })

    const originalName = Buffer.from(file.originalname, "latin1").toString("utf8")

    const fileRepo = AppDataSource.getRepository(UploadedFile)
    const record = fileRepo.create({
      resourceId,
      originalName,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      materialLabel: (req.body.materialLabel as string) || "",
    })
    await fileRepo.save(record)

    return res.status(201).json({ message: "上传成功", file: record })
  } catch (error) {
    console.error("文件上传错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

router.delete("/:resourceId/files/:fileId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const fileRepo = AppDataSource.getRepository(UploadedFile)
    const record = await fileRepo.findOneBy({ id: req.params.fileId as string, resourceId: req.params.resourceId as string })
    if (!record) return res.status(404).json({ message: "文件不存在" })

    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = await resourceRepo.findOneBy({ id: req.params.resourceId as string })
    if (!resource) return res.status(404).json({ message: "资源不存在" })
    if (resource.userId !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "无权限删除文件" })
    }

    const filePath = path.resolve(UPLOAD_DIR, record.storedName)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    await fileRepo.remove(record)
    return res.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除文件错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

router.get("/:resourceId/files", async (req, res: Response) => {
  try {
    const resourceId = req.params.resourceId as string
    const fileRepo = AppDataSource.getRepository(UploadedFile)
    const files = await fileRepo.find({
      where: { resourceId },
      order: { createdAt: "DESC" },
    })
    return res.json({ files })
  } catch (error) {
    console.error("获取文件列表错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})
export default router
