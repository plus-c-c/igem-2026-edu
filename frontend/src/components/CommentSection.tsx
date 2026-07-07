import { useEffect, useState } from "react"
import { ThumbsUp, Reply, Send } from "lucide-react"
import type { User } from "../types"
import { commentService, type CommentData } from "../services/commentService"

interface CommentSectionProps {
  resourceId: string | number
  user: User | null
}

function CommentItem({ comment, resourceId, user }: { comment: CommentData; resourceId: string; user: User | null }) {
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

  return (
    <div className="comment-item">
      <div className="comment-header">
        <strong className="comment-author">{comment.user.name}</strong>
        <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString("zh-CN")}</span>
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
            <div key={r.id} className="comment-item reply-item">
              <div className="comment-header">
                <strong className="comment-author">{r.user.name}</strong>
                <span className="comment-time">{new Date(r.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
              <p className="comment-content">{r.content}</p>
              <div className="comment-actions">
                <button className={`comment-action-btn ${r.likedByMe ? "liked" : ""}`} type="button" onClick={async () => {
                  try {
                    if (r.likedByMe) {
                      const res = await commentService.unlike(resourceId, r.id)
                      r.likesCount = res.likesCount
                      r.likedByMe = false
                    } else {
                      const res = await commentService.like(resourceId, r.id)
                      r.likesCount = res.likesCount
                      r.likedByMe = true
                    }
                  } catch {}
                }} disabled={!user}>
                  <ThumbsUp size={14} /> {r.likesCount || "赞"}
                </button>
              </div>
            </div>
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
          <CommentItem key={c.id} comment={c} resourceId={String(resourceId)} user={user} />
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
