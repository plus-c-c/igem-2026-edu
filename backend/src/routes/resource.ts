import { Router } from "express"
import { authMiddleware, optionalAuth } from "../middleware/auth"
import { create, list, get, getDraftForOriginal, update, remove, favorite, unfavorite, like, unlike } from "../controllers/resourceController"

const router = Router()

router.post("/", authMiddleware, create)
router.get("/", optionalAuth, list)
router.get("/draft-for/:originalId", authMiddleware, getDraftForOriginal)
router.get("/:id", optionalAuth, get)
router.put("/:id", authMiddleware, update)
router.delete("/:id", authMiddleware, remove)

router.post("/:id/favorite", authMiddleware, favorite)
router.delete("/:id/favorite", authMiddleware, unfavorite)
router.post("/:id/like", authMiddleware, like)
router.delete("/:id/like", authMiddleware, unlike)

export default router
