import { Router } from "express"
import { authMiddleware } from "../middleware/auth"
import { create, list, get, update, remove } from "../controllers/resourceController"

const router = Router()

router.post("/", authMiddleware, create)
router.get("/", list)
router.get("/:id", get)
router.put("/:id", authMiddleware, update)
router.delete("/:id", authMiddleware, remove)

export default router
