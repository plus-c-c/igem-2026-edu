import { useEffect, useState } from "react"
import { ThumbsUp, Reply, Send, Trash2 } from "lucide-react"
import type { User } from "../types"
import { commentService, type CommentData } from "../services/commentService"

interface CommentSectionProps {
  resourceId: string | number
  user: User | null
}

function ReplyItem({ reply, resourceId, user, onDelete }: { reply: CommentData; resourceId: string; user: User | null; onDelete: (id: string) => void }) {
  const [likesCount, setLikesCount] = useState(reply.likesCount)
  const [likedByMe, setLikedByMe] = useState(reply.likedByMe)

  const handleLike = async () => {
    if (!user) return
    try {
      if (likedByMe) {
        const res = await commentService.unlike(resourceId, reply.id)
        setLikesCount(res.likesCount)
        setLikedByMe(false)
      } else {
        const res = await commentService.like(resourceId, reply.id)
        setLikesCount(res.likesCount)
        setLikedByMe(true)
      }
    } catch {}
  }

  const handleDelete = async () => {
    if (!confirm("确定删除此回复？")) return
    try {
      await commentService.remove(resourceId, reply.id)
      onDelete(reply.id)
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败")
    }
  }

  const canDelete = user && (user.id === reply.userId || user.role === "admin")

  return (
    <div className="comment-item reply-item">
      <div className="comment-header">
        <strong className="comment-author">{reply.user.name}</strong>
        <span className="comment-time">{new Date(reply.createdAt).toLocaleDateString("zh-CN")}</span>
        {canDelete && (
          <button className="comment-delete-btn" type="button" onClick={handleDelete} title="删除">
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <p className="comment-content">{reply.content}</p>
      <div className="comment-actions">
        <button className={`comment-action-btn ${likedByMe ? "liked" : ""}`} type="button" onClick={handleLike} disabled={!user}>
          <ThumbsUp size={14} /> {likesCount || "赞"}
        </button>
      </div>
    </div>
  )
}

function CommentItem({ comment, resourceId, user, onDelete }: { comment: CommentData; resourceId: string; user: User | null; onDelete: (id: string) => void }) {
  const [likesCount, setLikesCount] = useState(comment.likesCount)
  const [likedByMe, setLikedByMe] = useState(comment.likedByMe)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)
  const [replies, setReplies] = useState(comment.replies)

  const handleLike = async () => {
    if (!user) return
    try {
      if (likedByMe) {
        const res = await commentService.unlike(resourceId, comment.id)
        setLikesCount(res.likesCount)
        setLikedByMe(false)
      } else {
        const res = await commentService.like(resourceId, comment.id)
        setLikesCount(res.likesCount)
        setLikedByMe(true)
      }
    } catch {}
  }

  const handleReply = async () => {
    if (!replyText.trim() || !user) return
    setReplying(true)
    try {
      const c = await commentService.reply(resourceId, comment.id, replyText.trim())
      setReplies((prev) => [...prev, c])
      setReplyText("")
      setShowReply(false)
    } catch {}
    setReplying(false)
  }

  const handleDelete = async () => {
    if (!confirm("确定删除此评论？")) return
    try {
      await commentService.remove(resourceId, comment.id)
      onDelete(comment.id)
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败")
    }
  }

  const handleReplyDelete = (replyId: string) => {
    setReplies((prev) => prev.filter((r) => r.id !== replyId))
  }

  const canDelete = user && (user.id === comment.userId || user.role === "admin")

  return (
    <div className="comment-item">
      <div className="comment-header">
        <strong className="comment-author">{comment.user.name}</strong>
        <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString("zh-CN")}</span>
        {canDelete && (
          <button className="comment-delete-btn" type="button" onClick={handleDelete} title="删除">
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <p className="comment-content">{comment.content}</p>
      <div className="comment-actions">
        <button className={`comment-action-btn ${likedByMe ? "liked" : ""}`} type="button" onClick={handleLike} disabled={!user}>
          <ThumbsUp size={14} /> {likesCount || "赞"}
        </button>
        {user && (
          <button className="comment-action-btn" type="button" onClick={() => setShowReply(!showReply)}>
            <Reply size={14} /> 回复
          </button>
        )}
      </div>
      {showReply && (
        <div className="reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`回复 ${comment.user.name}...`}
            rows={2}
          />
          <button className="pill-btn primary" type="button" onClick={handleReply} disabled={!replyText.trim() || replying}>
            <Send size={14} /> {replying ? "发送中..." : "回复"}
          </button>
        </div>
      )}
      {replies.length > 0 && (
        <div className="replies">
          {replies.map((r) => (
            <ReplyItem key={r.id} reply={r} resourceId={resourceId} user={user} onDelete={handleReplyDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentSection({ resourceId, user }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([])
  const [commentText, setCommentText] = useState("")
  const [commenting, setCommenting] = useState(false)

  const load = () => {
    commentService.list(String(resourceId)).then(setComments).catch(() => {})
  }

  useEffect(() => { load() }, [resourceId])

  const handleDelete = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const handleComment = async () => {
    if (!commentText.trim()) return
    setCommenting(true)
    try {
      const c = await commentService.create(String(resourceId), commentText.trim())
      setComments((prev) => [...prev, { ...c, replies: [] }])
      setCommentText("")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "评论失败"
      alert(msg)
    }
    setCommenting(false)
  }

  return (
    <section className="comment-section">
      <h2>评论 ({comments.length})</h2>
      <div className="comment-list">
        {comments.length === 0 && <p className="empty-state">暂无评论，来说两句吧</p>}
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} resourceId={String(resourceId)} user={user} onDelete={handleDelete} />
        ))}
      </div>
      {user ? (
        <div className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
          />
          <button className="pill-btn primary" type="button" onClick={handleComment} disabled={!commentText.trim() || commenting}>
            <Send size={16} /> {commenting ? "发送中..." : "发表评论"}
          </button>
        </div>
      ) : (
        <p className="login-hint">登录后可以发表评论</p>
      )}
    </section>
  )
}
