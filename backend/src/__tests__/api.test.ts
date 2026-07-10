import { describe, it, expect, beforeAll, afterAll } from "vitest"

const API = process.env.API_URL || "http://localhost:3000"

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

const testEmail = `test-${uid()}@example.com`
const testPassword = "pass123456"
let token = ""
let userId = ""
let resourceId = ""
let commentId = ""
let childCommentId = ""

beforeAll(async () => {
  const res = await fetch(`${API}/`).catch(() => null)
  if (!res || !res.ok) {
    throw new Error(`后端未运行或无法访问 (${API})`)
  }
  const data = await res.json()
  if (!data.message) {
    throw new Error(`后端响应异常: ${JSON.stringify(data)}`)
  }
})

describe("认证", () => {
  it("发送注册验证码", async () => {
    const res = await fetch(`${API}/api/auth/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Test Team",
        registrantName: "Tester",
        igemRole: "Wet Lab",
      }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toBeTruthy()
  })

  it("获取验证码并完成注册", async () => {
    const debugRes = await fetch(`${API}/api/auth/debug-code/${encodeURIComponent(testEmail)}`)
    expect(debugRes.status).toBe(200)
    const { code } = await debugRes.json()
    expect(code).toBeTruthy()

    const res = await fetch(`${API}/api/auth/verify-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, code }),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.token).toBeTruthy()
    expect(body.user.email).toBe(testEmail)
    expect(body.user.name).toBe("Test Team")
    token = body.token
    userId = body.user.id
  })

  it("使用密码登录", async () => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.token).toBeTruthy()
    token = body.token
  })

  it("获取当前用户信息", async () => {
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.email).toBe(testEmail)
  })

  it("修改用户信息", async () => {
    const res = await fetch(`${API}/api/auth/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: "Updated Team", igemRole: "Dry Lab" }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.name).toBe("Updated Team")
    expect(body.user.igemRole).toBe("Dry Lab")
  })

  it("修改密码并回退", async () => {
    const newPwd = "newpass789"
    const res = await fetch(`${API}/api/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: testPassword, newPassword: newPwd }),
    })
    expect(res.status).toBe(200)

    const loginRes = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: newPwd }),
    })
    expect(loginRes.status).toBe(200)
    token = (await loginRes.json()).token

    await fetch(`${API}/api/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: newPwd, newPassword: testPassword }),
    })
    const loginBack = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    })
    expect(loginBack.status).toBe(200)
    token = (await loginBack.json()).token
  })

  it("发送密码重置验证码", async () => {
    const res = await fetch(`${API}/api/auth/send-password-reset-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    })
    expect(res.status).toBe(200)
  })

  it("不存在邮箱发送重置码返回 404", async () => {
    const res = await fetch(`${API}/api/auth/send-password-reset-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent@example.com" }),
    })
    expect(res.status).toBe(404)
  })
})

describe("资源 CRUD", () => {
  it("创建项目", async () => {
    const res = await fetch(`${API}/api/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        team: "Test Team",
        title: "测试项目",
        category: "applications",
        subcategory: "合成生物学科普",
        desc: "这是一个测试项目描述",
        delivery: "线下",
        audience: "高中生",
        duration: "60 分钟",
        location: "测试教室",
        reimbursement: "无",
        contact: testEmail,
        type: "normal",
        status: "published",
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.resource.id).toBeTruthy()
    expect(body.resource.title).toBe("测试项目")
    resourceId = body.resource.id
  })

  it("获取资源列表", async () => {
    const res = await fetch(`${API}/api/resources`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.resources)).toBe(true)
    expect(body.resources.some((r: any) => r.id === resourceId)).toBe(true)
  })

  it("获取单个资源", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.resource.id).toBe(resourceId)
    expect(typeof body.likedByMe).toBe("boolean")
    expect(typeof body.favoritedByMe).toBe("boolean")
  })

  it("编辑项目", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: "已编辑的测试项目", desc: "已更新的描述",
        team: "Test Team", category: "applications", delivery: "线上",
        audience: "高中生", location: "测试教室", reimbursement: "无", contact: testEmail,
      }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.resource.title).toBe("已编辑的测试项目")
  })

  it("创建 campaign 类型项目", async () => {
    const res = await fetch(`${API}/api/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        team: "Test Team",
        title: "测试活动",
        category: "activities",
        desc: "一个测试活动",
        type: "campaign",
        status: "published",
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.resource.type).toBe("campaign")
  })

  it("非创建者无法编辑", async () => {
    const otherEmail = `other-${uid()}@example.com`
    await fetch(`${API}/api/auth/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: otherEmail, password: "other123456", name: "Other", registrantName: "Other", igemRole: "HP" }),
    })
    const { code } = await (await fetch(`${API}/api/auth/debug-code/${encodeURIComponent(otherEmail)}`)).json()
    const regRes = await fetch(`${API}/api/auth/verify-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: otherEmail, code }),
    })
    const otherToken = (await regRes.json()).token

    const res = await fetch(`${API}/api/resources/${resourceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${otherToken}` },
      body: JSON.stringify({ title: "被拒绝的修改" }),
    })
    expect(res.status).toBe(403)
  })

  it("按分类筛选资源", async () => {
    const res = await fetch(`${API}/api/resources?category=applications`)
    expect(res.status).toBe(200)
    const body = await res.json()
    body.resources.forEach((r: any) => {
      expect(r.category).toBe("applications")
    })
  })
})

describe("点赞与收藏", () => {
  it("点赞资源", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.likesCount).toBeGreaterThanOrEqual(1)
  })

  it("重复点赞返回已点赞", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await res.json()
    expect(body.message).toBe("已点赞")
  })

  it("取消点赞", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/like`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toBe("取消点赞成功")
  })

  it("取消未点赞返回未点赞", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/like`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await res.json()
    expect(body.message).toBe("未点赞")
  })

  it("收藏资源", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/favorite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.favoritesCount).toBeGreaterThanOrEqual(1)
  })

  it("重复收藏返回已收藏", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/favorite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await res.json()
    expect(body.message).toBe("已收藏")
  })

  it("取消收藏", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/favorite`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toBe("取消收藏成功")
  })

  it("获取收藏列表", async () => {
    await fetch(`${API}/api/resources/${resourceId}/favorite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    const res = await fetch(`${API}/api/resources/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.resources)).toBe(true)
    expect(body.resources.some((r: any) => r.id === resourceId)).toBe(true)
  })
})

describe("评论", () => {
  it("创建评论", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: "这是一条测试评论" }),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.comment.id).toBeTruthy()
    expect(body.comment.content).toBe("这是一条测试评论")
    expect(body.comment.likesCount).toBe(0)
    expect(body.comment.likedByMe).toBe(false)
    expect(body.comment.user).toBeTruthy()
    commentId = body.comment.id
  })

  it("回复评论", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/comments/${commentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: "这是一条回复" }),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.comment.parentId).toBe(commentId)
    childCommentId = body.comment.id
  })

  it("获取评论列表含回复", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.comments)).toBe(true)
    const parent = body.comments.find((c: any) => c.id === commentId)
    expect(parent).toBeTruthy()
    expect(parent.replies.length).toBeGreaterThanOrEqual(1)
    expect(parent.replies[0].id).toBe(childCommentId)
  })

  it("点赞评论", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/comments/${commentId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.likesCount).toBeGreaterThanOrEqual(1)
  })

  it("取消点赞评论", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}/comments/${commentId}/like`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toBe("取消点赞成功")
  })

  it("删除评论（含子评论和点赞）", async () => {
    await fetch(`${API}/api/resources/${resourceId}/comments/${commentId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    const res = await fetch(`${API}/api/resources/${resourceId}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)

    const listRes = await fetch(`${API}/api/resources/${resourceId}/comments`)
    const listBody = await listRes.json()
    expect(listBody.comments.some((c: any) => c.id === commentId)).toBe(false)
    expect(listBody.comments.some((c: any) => c.id === childCommentId)).toBe(false)
  })

  it("非创建者无法删除他人评论", async () => {
    const otherEmail = `other2-${uid()}@example.com`
    await fetch(`${API}/api/auth/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: otherEmail, password: "other123456", name: "Other2", registrantName: "Other2", igemRole: "HP" }),
    })
    const { code } = await (await fetch(`${API}/api/auth/debug-code/${encodeURIComponent(otherEmail)}`)).json()
    const regRes = await fetch(`${API}/api/auth/verify-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: otherEmail, code }),
    })
    const otherToken = (await regRes.json()).token

    const commentRes = await fetch(`${API}/api/resources/${resourceId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${otherToken}` },
      body: JSON.stringify({ content: "别人的评论" }),
    })
    const otherCommentId = (await commentRes.json()).comment.id

    const delRes = await fetch(`${API}/api/resources/${resourceId}/comments/${otherCommentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(delRes.status).toBe(403)
  })
})

describe("删除项目级联清理", () => {
  it("创建评论和点赞后删除项目，验证级联清理", async () => {
    const campRes = await fetch(`${API}/api/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        team: "Cascade Test",
        title: "级联测试项目",
        category: "cooperation",
        desc: "用于验证级联删除",
        delivery: "线上",
        audience: "大学生",
        duration: "30 分钟",
        location: "线上",
        reimbursement: "无",
        contact: testEmail,
        type: "normal",
        status: "published",
      }),
    })
    const cascadeResourceId = (await campRes.json()).resource.id

    const commentRes = await fetch(`${API}/api/resources/${cascadeResourceId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: "即将被级联删除的评论" }),
    })
    expect(commentRes.status).toBe(201)

    await fetch(`${API}/api/resources/${cascadeResourceId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    await fetch(`${API}/api/resources/${cascadeResourceId}/favorite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })

    const delRes = await fetch(`${API}/api/resources/${cascadeResourceId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(delRes.status).toBe(200)

    const getRes = await fetch(`${API}/api/resources/${cascadeResourceId}`)
    expect(getRes.status).toBe(404)

    const listRes = await fetch(`${API}/api/resources/${cascadeResourceId}/comments`)
    const listBody = await listRes.json()
    expect(listBody.comments.length).toBe(0)
  })
})

describe("非登录状态受限访问", () => {
  it("无 token 创建资源返回 401", async () => {
    const res = await fetch(`${API}/api/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "未登录测试", team: "N/A", category: "applications", desc: "test" }),
    })
    expect(res.status).toBe(401)
  })

  it("无 token 删除资源返回 401", async () => {
    const res = await fetch(`${API}/api/resources/${resourceId}`, {
      method: "DELETE",
    })
    expect(res.status).toBe(401)
  })
})

afterAll(async () => {
  if (token && resourceId) {
    await fetch(`${API}/api/resources/${resourceId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }
})
