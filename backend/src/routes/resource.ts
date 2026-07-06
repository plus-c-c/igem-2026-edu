import { Router, Response } from "express"
import { AppDataSource } from "../index"
import { Resource } from "../entity/Resource"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      team, title, negotiator, category, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact
    } = req.body

    const isCampaign = type === "campaign"
    if (isCampaign) {
      if (!title || !category || !format || !impact || !desc) {
        return res.status(400).json({ message: "请填写演示案例的必填字段" })
      }
    } else if (!team || !title || !category || !delivery || !audience || !location || !reimbursement || !contact || !desc) {
      return res.status(400).json({ message: "请填写必填字段" })
    }

    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = resourceRepo.create({
      userId: req.userId,
      team, title, negotiator, category, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact,
    })
    await resourceRepo.save(resource)

    return res.status(201).json({ message: "发布成功", resource })
  } catch (error) {
    console.error("创建资源错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

router.get("/", async (req, res: Response) => {
  try {
    const resourceRepo = AppDataSource.getRepository(Resource)
    const category = req.query.category as string | undefined
    const material = req.query.material as string | undefined
    const team = req.query.team as string | undefined
    const audience = req.query.audience as string | undefined

    const where: any = {}
    if (category && category !== "all") where.category = category
    if (team) where.team = team

    let resources = await resourceRepo.find({
      where,
      order: { createdAt: "DESC" }
    })

    if (material && material !== "all") {
      resources = resources.filter((r) => r.materials?.includes(material as string))
    }
    if (audience) {
      resources = resources.filter((r) => r.audience?.includes(audience as string))
    }

    return res.json({ resources })
  } catch (error) {
    console.error("获取资源错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

router.get("/:id", async (req, res: Response) => {
  try {
    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = await resourceRepo.findOneBy({ id: req.params.id as string })
    if (!resource) {
      return res.status(404).json({ message: "资源不存在" })
    }
    return res.json({ resource })
  } catch (error) {
    console.error("获取资源错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = await resourceRepo.findOneBy({ id: req.params.id as string })
    if (!resource) return res.status(404).json({ message: "资源不存在" })
    if (resource.userId !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "无权限修改此资源" })
    }

    const {
      team, title, negotiator, category, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact
    } = req.body

    const isCampaign = (type || resource.type) === "campaign"
    if (isCampaign) {
      if (!title || !category || !format || !impact || !desc) {
        return res.status(400).json({ message: "请填写演示案例的必填字段" })
      }
    } else if (!team || !title || !category || !delivery || !audience || !location || !reimbursement || !contact || !desc) {
      return res.status(400).json({ message: "请填写必填字段" })
    }

    resourceRepo.merge(resource, {
      team, title, negotiator, category, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact,
    })
    await resourceRepo.save(resource)

    return res.json({ message: "修改成功", resource })
  } catch (error) {
    console.error("修改资源错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = await resourceRepo.findOneBy({ id: req.params.id as string })
    if (!resource) {
      return res.status(404).json({ message: "资源不存在" })
    }
    if (resource.userId !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "无权限删除此资源" })
    }
    await resourceRepo.remove(resource)
    return res.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除资源错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
})

export default router
