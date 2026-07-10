import { Response } from "express"
import { In } from "typeorm"
import { AppDataSource } from "../index"
import { Comment } from "../entity/Comment"
import { CommentLike } from "../entity/CommentLike"
import { Resource } from "../entity/Resource"
import { User } from "../entity/User"
import { AuthRequest } from "../middleware/auth"

let _allUsers: Map<string, { id: string; name: string; email: string }> | null = null

async function loadUsers(): Promise<Map<string, { id: string; name: string; email: string }>> {
  if (_allUsers) return _allUsers
  const users = await AppDataSource.getRepository(User).find({ select: { id: true, name: true, email: true } })
  _allUsers = new Map(users.map((u) => [u.id, { id: u.id, name: u.name, email: u.email }]))
  return _allUsers
}

function userFor(id: string, users: Map<string, { id: string; name: string; email: string }>) {
  return users.get(id) || { id, name: "未知用户", email: "" }
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

    const users = await loadUsers()
    const u = userFor(comment.userId, users)

    return res.status(201).json({
      message: "评论成功",
      comment: {
        id: comment.id,
        resourceId: comment.resourceId,
        userId: comment.userId,
        content: comment.content,
        parentId: comment.parentId || null,
        createdAt: comment.createdAt,
        likesCount: 0,
        likedByMe: false,
        user: u,
      },
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

    const users = await loadUsers()
    const u = userFor(comment.userId, users)

    return res.status(201).json({
      message: "回复成功",
      comment: {
        id: comment.id,
        resourceId: comment.resourceId,
        userId: comment.userId,
        content: comment.content,
        parentId: comment.parentId || null,
        createdAt: comment.createdAt,
        likesCount: 0,
        likedByMe: false,
        user: u,
      },
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

export async function listByResource(req: AuthRequest, res: Response) {
  try {
    const resourceId = req.params.resourceId as string
    const userId = (req as AuthRequest).userId

    const commentRepo = AppDataSource.getRepository(Comment)
    const likeRepo = AppDataSource.getRepository(CommentLike)

    const comments = await commentRepo.find({
      where: { resourceId },
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

    const users = await loadUsers()
    const childMap = new Map<string, typeof comments>()
    const topLevel: typeof comments = []

    for (const c of comments) {
      if (c.parentId) {
        if (!childMap.has(c.parentId)) childMap.set(c.parentId, [])
        childMap.get(c.parentId)!.push(c)
      } else {
        topLevel.push(c)
      }
    }

    const result = topLevel.map((c) => ({
      id: c.id,
      resourceId: c.resourceId,
      userId: c.userId,
      content: c.content,
      parentId: c.parentId || null,
      createdAt: c.createdAt,
      likesCount: likesMap.get(c.id) || 0,
      likedByMe: likedSet.has(c.id),
      user: userFor(c.userId, users),
      replies: (childMap.get(c.id) || []).map((r) => ({
        id: r.id,
        resourceId: r.resourceId,
        userId: r.userId,
        content: r.content,
        parentId: r.parentId || null,
        createdAt: r.createdAt,
        likesCount: likesMap.get(r.id) || 0,
        likedByMe: likedSet.has(r.id),
        user: userFor(r.userId, users),
        replies: [],
      })),
    }))

    return res.json({ comments: result })
  } catch (error) {
    console.error("获取评论错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const commentId = req.params.commentId as string
    const userId = req.userId!
    const userRole = req.userRole

    const commentRepo = AppDataSource.getRepository(Comment)
    const comment = await commentRepo.findOneBy({ id: commentId })
    if (!comment) return res.status(404).json({ message: "评论不存在" })

    if (comment.userId !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "无权限删除此评论" })
    }

    const childIds = (await commentRepo.find({ where: { parentId: commentId }, select: { id: true } })).map((c) => c.id)
    const allIds = [commentId, ...childIds]
    await AppDataSource.getRepository(CommentLike).delete({ commentId: In(allIds) })
    await commentRepo.delete({ parentId: commentId })
    await commentRepo.delete({ id: commentId })

    return res.json({ message: "删除成功" })
  } catch (error) {
    console.error("删除评论错误:", error)
    return res.status(500).json({ message: "服务器内部错误" })
  }
}
