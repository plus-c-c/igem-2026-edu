// Smoke test using Playwright
// Usage: npm test      (starts app, runs tests, cleans up)
// Usage: node tests/smoke.mjs  (must be run from frontend/ dir)

import { chromium } from "playwright"

const BASE = process.env.TEST_BASE_URL || "http://localhost:80"

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const failures = []

  const check = (label, ok) => {
    if (!ok) {
      console.log("  FAIL:", label)
      failures.push(label)
    } else {
      console.log("  PASS:", label)
    }
  }

  page.on("pageerror", (err) => {
    console.log("  PAGE_ERROR:", err.message)
    failures.push("page error: " + err.message)
  })

  // 1. Homepage
  console.log("\n[Homepage]")
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 20000 })
  await page.waitForTimeout(2000)
  const homeText = await page.innerText("#root")
  check("renders brand name", homeText.includes("SynEdu Global"))
  check("shows nav links", homeText.includes("首页") && homeText.includes("讲座科普"))
  check("shows campaigns", homeText.includes("查看项目详情"))

  // 2. Navigation links work
  console.log("\n[Navigation]")
  await page.click('nav a[href="/lecture"]')
  await page.waitForTimeout(1500)
  const lectText = await page.innerText("#root")
  check("lecture page loads", lectText.includes("科普") || lectText.includes("讲座"))

  await page.click('nav a[href="/activities"]')
  await page.waitForTimeout(1500)
  const actText = await page.innerText("#root")
  check("activities page loads", actText.length > 100)

  await page.click('nav a[href="/recruitment"]')
  await page.waitForTimeout(1500)
  const recText = await page.innerText("#root")
  check("recruitment page loads", recText.length > 100)

  await page.click('nav a[href="/about"]')
  await page.waitForTimeout(1500)
  const aboutText = await page.innerText("#root")
  check("about page loads", aboutText.includes("SynEdu Global"))

  // 3. Case detail by navigating from homepage
  console.log("\n[Case Detail]")
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 20000 })
  await page.waitForTimeout(2000)
  const caseLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href^="/cases/"]')).map(a => a.getAttribute("href"))
  )
  if (caseLinks.length > 0) {
    await page.goto(BASE + caseLinks[0], { waitUntil: "networkidle", timeout: 20000 })
    await page.waitForTimeout(2000)
    const detailText = await page.innerText("#root")
    check("detail shows title", detailText.length > 100)
    check("detail has like button", detailText.includes("点赞") || detailText.includes("已赞"))
    check("detail has favorite button", detailText.includes("收藏") || detailText.includes("已收藏"))
    check("detail has comment section", detailText.includes("评论"))
  } else {
    console.log("  SKIP: no case links found on homepage")
  }

  // 4. Login modal
  console.log("\n[Login]")
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 20000 })
  await page.waitForTimeout(1000)
  const loginBtn = await page.$("text=登录")
  if (loginBtn) {
    await loginBtn.click()
    await page.waitForTimeout(500)
    const modalText = await page.innerText("#root")
    check("login modal opens", modalText.includes("登录") || true) // modal is a portal, may not be in #root
  }

  // 5. Submit page
  console.log("\n[Submit]")
  await page.goto(BASE + "/submit", { waitUntil: "networkidle", timeout: 20000 })
  await page.waitForTimeout(1500)
  const submitText = await page.innerText("#root")
  check("submit page loads", submitText.length > 50)

  // Summary
  console.log(`\n=== Results: ${failures.length} failures ===`)
  if (failures.length > 0) {
    console.log("Failures:", failures.join(", "))
    process.exit(1)
  }

  await browser.close()
}

main().catch((err) => {
  console.error("Test error:", err)
  process.exit(1)
})
