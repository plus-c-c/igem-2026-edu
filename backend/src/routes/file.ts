import { Router } from "express"
import { authMiddleware } from "../middleware/auth"
import { download, uploadFile, removeFile, listFiles, upload } from "../controllers/fileController"

const router = Router()

router.get("/files/:fileId/download", download)
router.post("/:resourceId/files", authMiddleware, upload.single("file"), uploadFile)
router.delete("/:resourceId/files/:fileId", authMiddleware, removeFile)
router.get("/:resourceId/files", listFiles)

export default router
