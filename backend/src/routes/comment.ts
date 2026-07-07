import { Router } from "express"
import { authMiddleware, optionalAuth } from "../middleware/auth"
import { create, reply, like, unlike, listByResource, remove } from "../controllers/commentController"

const router = Router()

router.post("/:resourceId/comments", authMiddleware, create)
router.post("/:resourceId/comments/:commentId/reply", authMiddleware, reply)
router.post("/:resourceId/comments/:commentId/like", authMiddleware, like)
router.delete("/:resourceId/comments/:commentId/like", authMiddleware, unlike)
router.get("/:resourceId/comments", optionalAuth, listByResource)
router.delete("/:resourceId/comments/:commentId", authMiddleware, remove)

export default router
