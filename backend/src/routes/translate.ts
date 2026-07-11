import { Router, Request, Response } from "express"

const router = Router()
const LT_URL = process.env.LT_URL || "http://127.0.0.1:5000"

interface TranslateBody {
  q: string
  source?: string
  target: string
}

const GLOSSARY_ZH_EN: [string, string][] = [
  ["科普", "science communication"],
  ["科普组", "Science Communication Group"],
  ["活动对象", "target audience"],
  ["活动形式", "activity format"],
  ["活动标题", "activity title"],
  ["上传活动", "submit an activity"],
  ["项目征集", "project call"],
  ["合作机会", "collaboration opportunity"],
  ["公众参与", "public engagement"],
  ["公众教育", "public education"],
  ["科学传播", "science communication"],
  ["教学资源", "teaching resources"],
  ["教育活动", "educational activity"],
  ["教育成果", "educational outcomes"],
  ["动手工作坊", "hands-on workshop"],
  ["主题展览", "themed exhibition"],
  ["游园活动", "interactive fair"],
  ["大型游园活动", "large-scale interactive fair"],
  ["户外活动", "outdoor activity"],
  ["场地活动", "venue-based activity"],
  ["误解", "misconception"],
  ["新兴技术", "emerging technologies"],
  ["合成生物学", "synthetic biology"],
  ["可持续发展目标", "Sustainable Development Goals"],
  ["生物材料", "biomaterials"],
  ["合作课程包", "co-developed course packages"],
  ["团队账号", "team account"],
  ["发布项目征集", "post a project call"],
  ["参与状态", "participation status"],
  ["可参与", "open"],
  ["活动概览", "activity overview"],
  ["活动详情", "activity details"],
  ["时长", "duration"],
  ["场地", "venue"],
  ["活动指南", "activity guide"],
  ["展区内容", "exhibition content"],
  ["组织者说明", "organizer notes"],
  ["适用场景", "suggested use"],
  ["预期成果", "expected outcomes"],
  ["项目亮点", "project highlights"],
  ["演示", "demonstration"],
  ["开放日", "open day"],
  ["传感器", "biosensor"],
  ["重金属离子", "heavy metal ions"],
  ["工程菌株", "engineered strain"],
  ["工程微生物", "engineered microorganisms"],
  ["水样", "water sample"],
  ["废水处理", "wastewater treatment"],
  ["微生物燃料电池", "microbial fuel cell"],
  ["产电菌", "electrogenic bacteria"],
  ["基因编辑", "gene editing"],
  ["作用机制", "mechanism of action"],
  ["伦理争议", "ethical debates"],
  ["圆桌讨论", "roundtable discussion"],
  ["DNA折纸", "DNA origami"],
  ["纳米结构", "nanostructures"],
  ["双螺旋结构", "double-helix structure"],
  ["纸质模型", "paper model"],
  ["难度等级", "difficulty level"],
  ["参与证书", "certificate of participation"],
  ["细胞工厂", "cell factory"],
  ["微生物", "microorganisms"],
  ["通识课程", "general education course"],
  ["高中选修课", "high school elective"],
  ["教师手册", "teacher manual"],
  ["学生学习单", "student worksheet"],
  ["评价量表", "assessment rubric"],
  ["实验设备", "experimental equipment"],
  ["合作需求", "collaboration needs"],
  ["展位活动", "outreach booth"],
  ["路演", "outreach roadshow"],
  ["开放参与", "open to participation"],
  ["不开放参与", "not open to participation"],
  ["线下", "in person"],
  ["展示方式", "layout"],
  ["单图", "single image"],
  ["双图布局", "two-image layout"],
  ["四图网格", "four-image grid"],
  ["图片授权", "image permission"],
  ["肖像授权", "portrait permission"],
  ["版权授权", "copyright permission"],
  ["侵权", "infringement"],
  ["上传团队", "uploading team"],
  ["安全提醒", "safety reminders"],
  ["教育非营利组织", "educational nonprofits"],
  ["教育实践", "educational practices"],
  ["科学传播平台", "platform for science communication"],
]

const ACRONYMS = new Set([
  "DNA", "RNA", "PCR", "GMO", "CRISPR", "SDG", "SDGs", "iGEM", "Gibson",
  "BBF", "SBOL", "IGEM", "WHO", "UNESCO", "UN", "EU", "US", "UK", "NASA",
  "EPA", "CDC", "FDA", "NIH", "NSF", "DARPA", "MIT", "ETH", "IIT",
  "MNS", "NLP", "CV", "API", "DIY", "BIO", "JBEI", "LBNL", "PNNL",
  "NREL", "ORNL", "ANL", "BNL", "SLAC", "FERMILAB", "CERN",
  "mRNA", "tRNA", "rRNA", "siRNA", "miRNA", "dsDNA", "ssDNA",
  "ATP", "ADP", "NAD", "NADH", "FAD", "FADH", "CoA", "GTP",
  "IPTG", "XGal", "LB", "OD", "UV", "PCR", "qPCR", "RT", "ELISA",
  "PAGE", "SDS", "DTT", "EDTA", "PBS", "HEPES", "Tris", "NaCl",
  "KCl", "MgCl", "CaCl", "SD", "RFP", "GFP", "YFP", "CFP", "BFP",
])

function normalizeCase(text: string): string {
  if (!text) return text
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]
  return sentences.map(sentence => {
    const trimmed = sentence.trim()
    if (!trimmed) return ""
    let firstCharDone = false
    const result = trimmed.replace(/\b(\w+)\b/g, (word) => {
      if (ACRONYMS.has(word)) return word
      if (ACRONYMS.has(word.toUpperCase())) return word.toUpperCase()
      const isAllCaps = word === word.toUpperCase() && word !== word.toLowerCase()
      if (isAllCaps && !firstCharDone) {
        firstCharDone = true
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
      if (isAllCaps) {
        return word.toLowerCase()
      }
      return word
    })
    if (!firstCharDone && result.length > 0) {
      return result.charAt(0).toUpperCase() + result.slice(1)
    }
    return result.charAt(0).toUpperCase() + result.slice(1)
  }).join(" ")
}

async function translateLT(text: string, target: string, source: string): Promise<string> {
  const response = await fetch(`${LT_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source, target }),
  })
  if (!response.ok) {
    return text
  }
  const data = await response.json()
  return data.translatedText || text
}

async function translateLTBatch(texts: string[], target: string, source: string): Promise<string[]> {
  const results = await Promise.all(texts.map(t => translateLT(t, target, source)))
  return results
}

function glossaryTranslate(text: string, target: string, source: string): { promise: Promise<string>; hit: boolean } {
  if (target !== "en" || GLOSSARY_ZH_EN.length === 0) {
    return { promise: Promise.resolve(text), hit: false }
  }

  const matchedTerms = GLOSSARY_ZH_EN
    .filter(([zh]) => text.includes(zh))
    .sort((a, b) => b[0].length - a[0].length)

  if (matchedTerms.length === 0) {
    return { promise: Promise.resolve(text), hit: false }
  }

  const placeholders = new Map<string, string>()
  let replaced = text
  matchedTerms.forEach(([zh, en], i) => {
    const ph = ` [${String.fromCharCode(65 + (i % 26))}${i >= 26 ? Math.floor(i / 26) : ""}] `
    placeholders.set(ph.trim(), en)
    replaced = replaced.split(zh).join(ph)
  })

  replaced = replaced.replace(/ {3,}/g, " ").trim()

  const promise = (async () => {
    let translated = await translateLT(replaced, target, source)

    for (const [ph, en] of placeholders) {
      const patterns = [
        new RegExp(ph.replace(/[[\]]/g, "\\$&"), "gi"),
        new RegExp(ph.replace(/[[\]]/g, "\\$&").replace(/ /g, "\\s*"), "gi"),
        new RegExp(ph.trim().replace(/[[\]]/g, "\\$&"), "gi"),
      ]
      for (const regex of patterns) {
        if (regex.test(translated)) {
          translated = translated.replace(regex, ` ${en} `)
          break
        }
      }
    }

    translated = translated.replace(/ {2,}/g, " ").trim()
    return translated
  })()

  return { promise, hit: true }
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { q, source, target } = req.body as TranslateBody
    if (!q || !target) {
      res.status(400).json({ error: "Missing required fields: q, target" })
      return
    }

    let translatedText: string
    const { promise, hit } = glossaryTranslate(q, target, source || "auto")
    if (hit) {
      translatedText = await promise
    } else {
      const response = await fetch(`${LT_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, source: source || "auto", target }),
      })
      if (!response.ok) {
        const text = await response.text()
        console.error("LibreTranslate error:", response.status, text)
        res.status(502).json({ error: "Translation service error" })
        return
      }
      const data = await response.json()
      translatedText = data.translatedText || ""
    }
    if (target === "en") {
      translatedText = normalizeCase(translatedText)
    }
    res.json({ translatedText })
  } catch (err) {
    console.error("Translate proxy error:", err)
    res.status(502).json({ error: "Translation service unavailable" })
  }
})

export default router
