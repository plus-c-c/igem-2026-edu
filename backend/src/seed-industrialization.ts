import "reflect-metadata"
import "./config/env"
import { createMainDataSource } from "./config/database"
import { User } from "./entity/User"
import { Resource } from "./entity/Resource"

interface IndustrialDiscussion {
  team: string
  title: string
  tag: string
  desc: string
  introductionContent: string
  image: string
  format: string
  eventDate: string
  locationType: string
  locationCity: string
  timeLimitType: string
  audience: string
  contact: string
  canParticipate: string
  duration: string
}

const discussions: IndustrialDiscussion[] = [
  {
    team: "Jiangnan-China",
    title: "从实验室走向产业，第一道门槛是什么？（示例）",
    tag: "技术转化",
    desc: "从实验室成果到量产落地，合成生物学团队最先跨越的门槛往往是技术放大与成本控制。围绕这一话题，我们邀请高校课题组与产业方展开坦诚对话。",
    image: "/images/lab-work.jpg",
    format: "圆桌讨论 + 产业导师分享",
    eventDate: "2026-10-18",
    locationType: "线上,线下",
    locationCity: "无锡",
    timeLimitType: "无时限",
    audience: "高校课题组 / 产业方代表",
    contact: "jiangnan-hp@synedu-global.org",
    canParticipate: "yes",
    duration: "90 分钟",
    introductionContent:
      "## 背景\n\n合成生物学产品从实验室走向产业化，通常要经历「概念验证 → 中试放大 → 规模化生产 → 市场准入」四个阶段。其中第一道门槛，往往不是科研本身，而是技术与工程之间的衔接。\n\n## 讨论要点\n\n- 菌株放大过程中的表型漂移如何解决\n- 从克级到吨级，工艺参数如何系统化\n- 生产成本与产品价格的平衡点在哪里\n\n## 延伸\n\n欢迎在评论区分享你所在团队在放大过程中遇到的实际问题。",
  },
  {
    team: "XJTLU-China",
    title: "科研团队与企业应该如何有效对话？（示例）",
    tag: "校企交流",
    desc: "科研更关注原理突破，企业更关心稳定交付。双方如何找到共同语言，建立高效的产学研协作机制？",
    image: "/images/alliance.jpg",
    format: "校企对话工作坊",
    eventDate: "2026-10-25",
    locationType: "线上",
    locationCity: "苏州",
    timeLimitType: "无时限",
    audience: "科研团队 / 企业研发部门",
    contact: "xjtu-hp@synedu-global.org",
    canParticipate: "yes",
    duration: "120 分钟",
    introductionContent:
      "## 背景\n\n科研团队与企业的目标函数并不总是一致：学术追求新意，产业追求稳定。两者的对话质量，往往决定了技术转移的成败。\n\n## 讨论要点\n\n- 如何用产业听得懂的语言介绍技术价值\n- 里程碑、交付物与知识产权的边界如何约定\n- 联合实验室与共建课题的常见合作框架\n\n## 延伸\n\n如果你们团队有过校企合作经历，欢迎分享其中的磨合经验。",
  },
  {
    team: "ZJU-China",
    title: "合成生物学产品如何建立公众信任？（示例）",
    tag: "社会沟通",
    desc: "技术成熟不等于市场接受。面对公众对新型生物技术的疑虑，透明沟通与参与式科普是建立信任的关键路径。",
    image: "/images/students.jpg",
    format: "公众开放论坛",
    eventDate: "2026-11-07",
    locationType: "线上,线下",
    locationCity: "杭州",
    timeLimitType: "无时限",
    audience: "社会公众 / 监管与科普机构",
    contact: "zju-hp@synedu-global.org",
    canParticipate: "yes",
    duration: "100 分钟",
    introductionContent:
      "## 背景\n\n公众对合成生物学产品的接受度，受到信息透明度、风险沟通与价值感知的共同影响。建立信任，往往比技术本身更早地决定产品能否上市。\n\n## 讨论要点\n\n- 上市前是否需要开展公众沟通与风险感知调查\n- 标签、知情选择与监管透明度的作用\n- 科普内容如何平衡专业性与可读性\n\n## 延伸\n\n欢迎提供你们团队开展公众沟通的案例与数据。",
  },
]

async function seed() {
  const ds = createMainDataSource(false)
  await ds.initialize()

  const userRepo = ds.getRepository(User)
  const admin = await userRepo.findOneBy({ role: "admin" })
  if (!admin) {
    console.error("未找到管理员账号，请先执行 seed.ts 创建管理员")
    await ds.destroy()
    process.exit(1)
  }

  const resourceRepo = ds.getRepository(Resource)

  console.log(`\n开始录入 ${discussions.length} 个产业化教育示例讨论...\n`)

  let done = 0

  for (const d of discussions) {
    const existing = await resourceRepo.findOneBy({ category: "industrialization", title: d.title })
    const fields = {
      team: d.team,
      subcategory: d.tag,
      type: "discussion",
      status: "published" as const,
      desc: d.desc,
      introductionContent: d.introductionContent,
      image: d.image,
      format: d.format,
      eventDate: d.eventDate,
      locationType: d.locationType,
      locationCity: d.locationCity,
      timeLimitType: d.timeLimitType,
      audience: d.audience,
      contact: d.contact,
      canParticipate: d.canParticipate,
      duration: d.duration,
      acceptsOthers: "no",
      imageAuthorization: true,
    }
    if (existing) {
      Object.assign(existing, fields)
      await resourceRepo.save(existing)
      console.log(`更新 ${d.title}`)
    } else {
      const resource = resourceRepo.create({
        userId: admin.id,
        ...fields,
        category: "industrialization",
      })
      await resourceRepo.save(resource)
      console.log(`✓ [产业化教育] ${d.title}`)
    }
    done++
  }

  await ds.destroy()
  console.log(`\n录入完毕：处理 ${done} 个讨论`)
}

seed().catch((err) => {
  console.error("产业化教育示例数据录入失败:", err)
  process.exit(1)
})