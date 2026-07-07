import { Response } from "express"
import { In } from "typeorm"
import { AppDataSource } from "../index"
import { Comment } from "../entity/Comment"
import { CommentLike } from "../entity/CommentLike"
import { Resource } from "../entity/Resource"
import { AuthRequest } from "../middleware/auth"

function formatComment(c: Comment, likesCount: number, likedByMe: boolean) {
  return {
    id: c.id,
    resourceId: c.resourceId,
    userId: c.userId,
    content: c.content,
    parentId: c.parentId || null,
    createdAt: c.createdAt,
    likesCount,
    likedByMe,
    user: { id: c.user.id, name: c.user.name, email: c.user.email },
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const resourceId = req.params.resourceId as string
    const { content } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "评论内容不能为空" })
    }

    const resourceRepo = AppDataSource.getRepository(Resource)
    const resource = await resourceRepo.findOneBy({ id: resourceId })
    if (!resource) return res.status(404).json({ message: "资源不存在" })

    const commentRepo = AppDataSource.getRepository(Comment)
    const comment = commentRepo.create({
      resourceId,
      userId: req.userId,
      content: content.trim(),
    })
    await commentRepo.save(comment)

    const full = await commentRepo.findOne({
      where: { id: comment.id },
      relations: { user: true },
    })

    return res.status(201).json({
      message: "评论成功",
      comment: full ? formatComment(full, 0, false) : comment,
    })
  } catch (error) {
    console.error("创建评论错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function reply(req: AuthRequest, res: Response) {
  try {
    const resourceId = req.params.resourceId as string
    const parentId = req.params.commentId as string
    const { content } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "回复内容不能为空" })
    }

    const commentRepo = AppDataSource.getRepository(Comment)
    const parent = await commentRepo.findOneBy({ id: parentId, resourceId })
    if (!parent) return res.status(404).json({ message: "评论不存在" })

    const comment = commentRepo.create({
      resourceId,
      userId: req.userId,
      content: content.trim(),
      parentId,
    })
    await commentRepo.save(comment)

    const full = await commentRepo.findOne({
      where: { id: comment.id },
      relations: { user: true },
    })

    return res.status(201).json({
      message: "回复成功",
      comment: full ? formatComment(full, 0, false) : comment,
    })
  } catch (error) {
    console.error("回复评论错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function like(req: AuthRequest, res: Response) {
  try {
    const commentId = req.params.commentId as string
    const userId = req.userId!

    const commentRepo = AppDataSource.getRepository(Comment)
    const comment = await commentRepo.findOneBy({ id: commentId })
    if (!comment) return res.status(404).json({ message: "评论不存在" })

    const likeRepo = AppDataSource.getRepository(CommentLike)
    const existing = await likeRepo.findOneBy({ commentId, userId })
    if (existing) return res.json({ message: "已点赞" })

    const likeEntry = likeRepo.create({ commentId, userId })
    await likeRepo.save(likeEntry)

    const count = await likeRepo.countBy({ commentId })
    return res.json({ message: "点赞成功", likesCount: count })
  } catch (error) {
    console.error("点赞错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function unlike(req: AuthRequest, res: Response) {
  try {
    const commentId = req.params.commentId as string
    const userId = req.userId!

    const likeRepo = AppDataSource.getRepository(CommentLike)
    const existing = await likeRepo.findOneBy({ commentId, userId })
    if (!existing) return res.json({ message: "未点赞" })

    await likeRepo.remove(existing)

    const count = await likeRepo.countBy({ commentId })
    return res.json({ message: "取消点赞成功", likesCount: count })
  } catch (error) {
    console.error("取消点赞错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

function buildTree(comments: Comment[], likesMap: Map<string, number>, likedMap: Set<string>) {
  const topLevel = comments.filter((c) => !c.parentId)
  const childMap = new Map<string, Comment[]>()
  for (const c of comments) {
    if (c.parentId) {
      if (!childMap.has(c.parentId)) childMap.set(c.parentId, [])
      childMap.get(c.parentId)!.push(c)
    }
  }
  return topLevel.map((c) => ({
    ...formatComment(c, likesMap.get(c.id) || 0, likedMap.has(c.id)),
    replies: (childMap.get(c.id) || []).map((r) => ({
      ...formatComment(r, likesMap.get(r.id) || 0, likedMap.has(r.id)),
      replies: [],
    })),
  }))
}

export async function listByResource(req: AuthRequest, res: Response) {
  try {
    const resourceId = req.params.resourceId as string
    const userId = (req as AuthRequest).userId

    const commentRepo = AppDataSource.getRepository(Comment)
    const likeRepo = AppDataSource.getRepository(CommentLike)

    const comments = await commentRepo.find({
      where: { resourceId },
      relations: { user: true },
      order: { createdAt: "ASC" },
    })

    const commentIds = comments.map((c) => c.id)
    const likes = commentIds.length
      ? await likeRepo.findBy({ commentId: In(commentIds) })
      : []

    const likesMap = new Map<string, number>()
    const likedSet = new Set<string>()
    for (const l of likes) {
      likesMap.set(l.commentId, (likesMap.get(l.commentId) || 0) + 1)
      if (userId && l.userId === userId) likedSet.add(l.commentId)
    }

    return res.json({ comments: buildTree(comments, likesMap, likedSet) })
  } catch (error) {
    console.error("获取评论错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}
