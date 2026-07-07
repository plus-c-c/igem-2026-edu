import { Response } from "express"
import fs from "fs"
import { AppDataSource, CommentDataSource } from "../index"
import { Resource } from "../entity/Resource"
import { UploadedFile } from "../entity/File"
import { Favorite } from "../entity/Favorite"
import { ResourceLike } from "../entity/ResourceLike"
import { AuthRequest } from "../middleware/auth"

export async function create(req: AuthRequest, res: Response) {
  try {
    const {
      team, title, negotiator, category, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact, campaignSteps,
      canParticipate, locationType, locationCountry, locationProvince, locationCity,
      eventDate, timeLimitType,
      sitePhotosFormat, sitePhotoIds, introductionContent, tips,
    } = req.body

    const isCampaign = type === "campaign"
    if (!isCampaign && !team) {
      return res.status(400).json({ message: "请填写必填字段" })
    }

    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = resourceRepo.create({
      userId: req.userId,
      team, title, negotiator, category, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact, campaignSteps,
      canParticipate, locationType, locationCountry, locationProvince, locationCity,
      eventDate, timeLimitType,
      sitePhotosFormat, sitePhotoIds, introductionContent, tips,
    })
    await resourceRepo.save(resource)

    return res.status(201).json({ message: "发布成功", resource })
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
}

export async function get(req: AuthRequest, res: Response) {
  try {
    const userId = (req as AuthRequest).userId
    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = await resourceRepo.findOneBy({ id: req.params.id as string })
    if (!resource) {
      return res.status(404).json({ message: "资源不存在" })
    }

    let likedByMe = false
    let favoritedByMe = false
    if (userId) {
      const [fav, like] = await Promise.all([
        CommentDataSource.getRepository(Favorite).findOneBy({ userId, resourceId: resource.id }),
        CommentDataSource.getRepository(ResourceLike).findOneBy({ userId, resourceId: resource.id }),
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
    const repo = CommentDataSource.getRepository(Favorite)
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
    const repo = CommentDataSource.getRepository(Favorite)
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

export async function like(req: AuthRequest, res: Response) {
  try {
    const resourceId = req.params.id as string
    const userId = req.userId!
    const repo = CommentDataSource.getRepository(ResourceLike)
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
    const repo = CommentDataSource.getRepository(ResourceLike)
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
      team, title, negotiator, category, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact, campaignSteps,
      canParticipate, locationType, locationCountry, locationProvince, locationCity,
      eventDate, timeLimitType,
      sitePhotosFormat, sitePhotoIds, introductionContent, tips,
    } = req.body

    const isCampaign = (type || resource.type) === "campaign"
    if (isCampaign) {
      if (!title || !category || !desc) {
        return res.status(400).json({ message: "请填写必填字段" })
      }
    } else if (!team || !title || !category || !delivery || !audience || !location || !reimbursement || !contact || !desc) {
      return res.status(400).json({ message: "请填写必填字段" })
    }

    resourceRepo.merge(resource, {
      team, title, negotiator, category, acceptsOthers,
      delivery, audience, duration, location, reimbursement,
      contact, desc, materials, type, subtitle, image, format, impact, campaignSteps,
      canParticipate, locationType, locationCountry, locationProvince, locationCity,
      eventDate, timeLimitType,
      sitePhotosFormat, sitePhotoIds, introductionContent, tips,
    })
    await resourceRepo.save(resource)

    return res.json({ message: "修改成功", resource })
  } catch (error) {
    console.error("修改资源错误:", error)
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
    const fileRepo = AppDataSource.getRepository(UploadedFile)
    const files = await fileRepo.findBy({ resourceId: resource.id })
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
