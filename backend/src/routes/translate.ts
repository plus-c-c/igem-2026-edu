import { Router, Request, Response } from "express"

const router = Router()
const LT_URL = process.env.LT_URL || "http://libretranslate:5000"

interface TranslateBody {
  q: string
  source?: string
  target: string
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { q, source, target } = req.body as TranslateBody
    if (!q || !target) {
      res.status(400).json({ error: "Missing required fields: q, target" })
      return
    }

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
    res.json(data)
  } catch (err) {
    console.error("Translate proxy error:", err)
    res.status(502).json({ error: "Translation service unavailable" })
  }
})

export default router
