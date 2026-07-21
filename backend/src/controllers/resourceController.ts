import { Response } from "express"
import fs from "fs"
import { In } from "typeorm"
import { AppDataSource } from "../index"
import { Resource } from "../entity/Resource"
import { UploadedFile } from "../entity/File"
import { Comment } from "../entity/Comment"
import { CommentLike } from "../entity/CommentLike"
import { Favorite } from "../entity/Favorite"
import { ResourceLike } from "../entity/ResourceLike"
import { AuthRequest } from "../middleware/auth"

export async function create(req: AuthRequest, res: Response) {
  try {
    const {
      team, title, negotiator, category, subcategory, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact, campaignSteps,
      canParticipate, locationType, locationCountry, locationProvince, locationCity,
      eventDate, timeLimitType,
      sitePhotosFormat, sitePhotoIds, introductionContent, tips, status, imageAuthorization,
    } = req.body

    const isCampaign = type === "campaign"
    if (!isCampaign && !team) {
      return res.status(400).json({ message: "请填写必填字段" })
    }

    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = resourceRepo.create({
      userId: req.userId,
      team, title, negotiator, category, subcategory, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact, campaignSteps,
      canParticipate, locationType, locationCountry, locationProvince, locationCity,
      eventDate, timeLimitType,
      sitePhotosFormat, sitePhotoIds, introductionContent, tips, imageAuthorization,
      status: status || "draft",
    })
    await resourceRepo.save(resource)

    return res.status(201).json({ message: "保存成功", resource })
  } catch (error) {
    console.error("创建资源错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const resourceRepo = AppDataSource.getRepository(Resource)
    const category = req.query.category as string | undefined
    const material = req.query.material as string | undefined
    const team = req.query.team as string | undefined
    const audience = req.query.audience as string | undefined
    const status = req.query.status as string | undefined

    const where: any = {}

    if (status === "draft") {
      if (!req.userId) return res.status(401).json({ message: "请先登录" })
      where.userId = req.userId
      where.status = "draft"
    } else {
      if (req.userRole !== "admin") {
        where.status = "published"
      }
    }

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
}

export async function get(req: AuthRequest, res: Response) {
  try {
    const userId = (req as AuthRequest).userId
    const userRole = (req as AuthRequest).userRole
    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = await resourceRepo.findOneBy({ id: req.params.id as string })
    if (!resource) {
      return res.status(404).json({ message: "资源不存在" })
    }

    if (resource.status === "draft" && resource.userId !== userId && userRole !== "admin") {
      return res.status(404).json({ message: "资源不存在" })
    }

    let likedByMe = false
    let favoritedByMe = false
    if (userId) {
      const [fav, like] = await Promise.all([
        AppDataSource.getRepository(Favorite).findOneBy({ userId, resourceId: resource.id }),
        AppDataSource.getRepository(ResourceLike).findOneBy({ userId, resourceId: resource.id }),
      ])
      favoritedByMe = !!fav
      likedByMe = !!like
    }

    return res.json({ resource, likedByMe, favoritedByMe })
  } catch (error) {
    console.error("获取资源错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function favorite(req: AuthRequest, res: Response) {
  try {
    const resourceId = req.params.id as string
    const userId = req.userId!
    const repo = AppDataSource.getRepository(Favorite)
    const existing = await repo.findOneBy({ userId, resourceId })
    if (existing) return res.json({ message: "已收藏" })
    const fav = repo.create({ userId, resourceId })
    await repo.save(fav)
    const count = await repo.countBy({ resourceId })
    return res.json({ message: "收藏成功", favoritesCount: count })
  } catch (error) {
    console.error("收藏错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function unfavorite(req: AuthRequest, res: Response) {
  try {
    const resourceId = req.params.id as string
    const userId = req.userId!
    const repo = AppDataSource.getRepository(Favorite)
    const existing = await repo.findOneBy({ userId, resourceId })
    if (!existing) return res.json({ message: "未收藏" })
    await repo.remove(existing)
    const count = await repo.countBy({ resourceId })
    return res.json({ message: "取消收藏成功", favoritesCount: count })
  } catch (error) {
    console.error("取消收藏错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function getMyFavorites(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const favRepo = AppDataSource.getRepository(Favorite)
    const favorites = await favRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })
    if (favorites.length === 0) return res.json({ resources: [] })

    const resourceIds = favorites.map((f) => f.resourceId)
    const resourceRepo = AppDataSource.getRepository(Resource)
    const resources = await resourceRepo.find({ where: { id: In(resourceIds) } })
    const resourceMap = new Map(resources.map((r) => [r.id, r]))

    const ordered = favorites
      .map((f) => resourceMap.get(f.resourceId))
      .filter(Boolean)

    return res.json({ resources: ordered })
  } catch (error) {
    console.error("获取收藏列表错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function like(req: AuthRequest, res: Response) {
  try {
    const resourceId = req.params.id as string
    const userId = req.userId!
    const repo = AppDataSource.getRepository(ResourceLike)
    const existing = await repo.findOneBy({ userId, resourceId })
    if (existing) return res.json({ message: "已点赞" })
    const l = repo.create({ userId, resourceId })
    await repo.save(l)
    const count = await repo.countBy({ resourceId })
    return res.json({ message: "点赞成功", likesCount: count })
  } catch (error) {
    console.error("点赞错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function unlike(req: AuthRequest, res: Response) {
  try {
    const resourceId = req.params.id as string
    const userId = req.userId!
    const repo = AppDataSource.getRepository(ResourceLike)
    const existing = await repo.findOneBy({ userId, resourceId })
    if (!existing) return res.json({ message: "未点赞" })
    await repo.remove(existing)
    const count = await repo.countBy({ resourceId })
    return res.json({ message: "取消点赞成功", likesCount: count })
  } catch (error) {
    console.error("取消点赞错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = await resourceRepo.findOneBy({ id: req.params.id as string })
    if (!resource) return res.status(404).json({ message: "资源不存在" })
    if (resource.userId !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "无权限修改此资源" })
    }

    const {
      team, title, negotiator, category, subcategory, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact, campaignSteps,
      canParticipate, locationType, locationCountry, locationProvince, locationCity,
      eventDate, timeLimitType,
      sitePhotosFormat, sitePhotoIds, introductionContent, tips, status, imageAuthorization,
    } = req.body

    const isDraftSave = status === "draft" || (!status && resource.status === "draft")
    if (!isDraftSave) {
      const isCampaign = (type || resource.type) === "campaign"
      if (isCampaign) {
        if (!title || !category || !desc) {
          return res.status(400).json({ message: "请填写必填字段" })
        }
      } else if (!team || !title || !category || !delivery || !audience || !location || !reimbursement || !contact || !desc) {
        return res.status(400).json({ message: "请填写必填字段" })
      }
    }

    resourceRepo.merge(resource, {
      team, title, negotiator, category, subcategory, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact, campaignSteps,
      canParticipate, locationType, locationCountry, locationProvince, locationCity,
      eventDate, timeLimitType,
      sitePhotosFormat, sitePhotoIds, introductionContent, tips, status, imageAuthorization,
    })
    await resourceRepo.save(resource)

    return res.json({ message: "修改成功", resource })
  } catch (error) {
    console.error("修改资源错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function getDraftForOriginal(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId
    if (!userId) return res.status(401).json({ message: "请先登录" })
    const originalId = req.params.originalId as string
    const resourceRepo = AppDataSource.getRepository(Resource)
    const draft = await resourceRepo.findOneBy({ originalId, userId, status: "draft" })
    if (!draft) return res.status(404).json({ message: "草稿不存在" })
    return res.json({ resource: draft })
  } catch (error) {
    console.error("获取草稿错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = await resourceRepo.findOneBy({ id: req.params.id as string })
    if (!resource) {
      return res.status(404).json({ message: "资源不存在" })
    }
    if (resource.userId !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "无权限删除此资源" })
    }

    const resourceId = resource.id

    await AppDataSource.getRepository(ResourceLike).delete({ resourceId })
    await AppDataSource.getRepository(Favorite).delete({ resourceId })

    const commentRepo = AppDataSource.getRepository(Comment)
    const comments = await commentRepo.find({ where: { resourceId }, select: { id: true } })
    const commentIds = comments.map((c) => c.id)
    if (commentIds.length) {
      await AppDataSource.getRepository(CommentLike).delete({ commentId: In(commentIds) })
    }
    await commentRepo.delete({ resourceId })

    const fileRepo = AppDataSource.getRepository(UploadedFile)
    const files = await fileRepo.findBy({ resourceId })
    for (const f of files) {
      const path = `backend/uploads/${f.storedName}`
      if (fs.existsSync(path)) fs.unlinkSync(path)
    }
    if (files.length) await fileRepo.remove(files)
    await resourceRepo.remove(resource)
    return res.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除资源错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}
