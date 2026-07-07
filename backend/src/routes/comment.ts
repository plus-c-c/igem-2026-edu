import { Router } from "express"
import { authMiddleware } from "../middleware/auth"
import { create, reply, like, unlike, listByResource } from "../controllers/commentController"

const router = Router()

router.post("/:resourceId/comments", authMiddleware, create)
router.post("/:resourceId/comments/:commentId/reply", authMiddleware, reply)
router.post("/:resourceId/comments/:commentId/like", authMiddleware, like)
router.delete("/:resourceId/comments/:commentId/like", authMiddleware, unlike)
router.get("/:resourceId/comments", listByResource)

export default router
