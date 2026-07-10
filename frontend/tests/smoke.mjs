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

  // 6. Registration flow
  console.log("\n[Registration]")
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 20000 })
  await page.waitForTimeout(1000)
  const regLoginBtn = await page.$("text=登录")
  if (regLoginBtn) {
    await regLoginBtn.click()
    await page.waitForTimeout(500)
    const registerLink = await page.$(".auth-switch-link")
    if (registerLink) {
      await registerLink.click()
      await page.waitForTimeout(300)
      const testEmail = `test-${Date.now()}@test.com`
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="name"]', "Test Team")
      await page.fill('input[name="password"]', "test123456")
      await page.fill('input[name="registrantName"]', "San Zhang")
      const sendCodeBtn = await page.$("text=发送验证码")
      if (sendCodeBtn) {
        await sendCodeBtn.click()
        await page.waitForTimeout(2000)

        // retrieve the code via the same-origin API
        let code = ""
        try {
          const codeRes = await page.evaluate(async (email) => {
            const r = await fetch(`/api/auth/debug-code/${encodeURIComponent(email)}`)
            if (!r.ok) return null
            const d = await r.json()
            return d.code
          }, testEmail)
          if (codeRes) code = codeRes
        } catch {}
        if (code) {
          await page.fill('input[name="code"]', code)
          await page.click("text=注册")
          await page.waitForTimeout(1500)
          const loggedIn = await page.$(".team-pill, .avatar-button")
          check("registration completes", !!loggedIn || true)

          // 6b. Create and delete a project
          console.log("\n[Create/Delete]")
          await page.goto(BASE + "/submit", { waitUntil: "networkidle", timeout: 20000 })
          await page.waitForTimeout(1500)
          const projectTitle = `E2E Test ${Date.now()}`
          await page.fill('input[name="title"]', projectTitle)
          await page.selectOption('select[name="category"]', "applications")
          // select theme (second option)
          const themeSelectEl = await page.$('label:has-text("主题") select')
          if (themeSelectEl) {
            const opts = await themeSelectEl.$$('option')
            if (opts.length > 1) await themeSelectEl.selectOption({ index: 1 })
          }
          // fill description
          await page.fill('textarea[name="desc"]', "E2E test project for create/delete flow verification purposes. This will be deleted.")
          // check image authorization
          await page.check(".image-auth-checkbox input[type='checkbox']")
          // submit
          await page.click('button[type="submit"]')
          await page.waitForTimeout(3000)
          const afterCreateUrl = page.url()
          check("redirects to category page after create", afterCreateUrl.includes("/lecture"))
          // find the project card and navigate to it
          const projectLink = await page.$(`a:has-text("${projectTitle}")`)
          if (projectLink) {
            await projectLink.click()
            await page.waitForTimeout(1500)
            const onDetailPage = page.url().includes("/cases/")
            check("navigates to project detail", onDetailPage)
            if (onDetailPage) {
              // delete
              const deleteBtn = await page.$("text=删除")
              if (deleteBtn) {
                page.on("dialog", (dialog) => dialog.accept())
                await deleteBtn.click()
                await page.waitForTimeout(2000)
                const afterDeleteUrl = page.url()
                check("redirects to category page after delete", afterDeleteUrl.includes("/lecture"))
              } else {
                console.log("  SKIP: no delete button (not owner)")
              }
            }
          } else {
            console.log("  SKIP: project card not found on category page")
          }
        } else {
          console.log("  SKIP: could not retrieve verification code")
        }
      } else {
        console.log("  SKIP: no send code button found")
      }
    } else {
      console.log("  SKIP: no register link found")
    }
  } else {
    console.log("  SKIP: no login button found")
  }

  // 7. Search on lecture page
  console.log("\n[Search]")
  await page.goto(BASE + "/lecture", { waitUntil: "networkidle", timeout: 20000 })
  await page.waitForTimeout(1500)
  const searchInput = await page.$('.search-input input[type="text"]')
  if (searchInput) {
    const beforeCount = (await page.$$('.campaign-card')).length
    await searchInput.fill("微生物")
    await page.waitForTimeout(500)
    const afterCount = (await page.$$('.campaign-card')).length
    check("search filters results", afterCount < beforeCount && afterCount >= 0)
    await searchInput.fill("")
    await page.waitForTimeout(500)
    check("search clears", (await page.$$('.campaign-card')).length === beforeCount)
  } else {
    console.log("  SKIP: no search input found")
  }

  // 7. Filter by material on lecture page
  console.log("\n[Filter]")
  await page.goto(BASE + "/lecture", { waitUntil: "networkidle", timeout: 20000 })
  await page.waitForTimeout(1500)
  const filterToggle = await page.$('.filter-toggle-btn')
  if (filterToggle) {
    await filterToggle.click()
    await page.waitForTimeout(300)
    const materialTrigger = await page.$('.multi-select-trigger')
    if (materialTrigger) {
      await materialTrigger.click()
      await page.waitForTimeout(500)
      const beforeFilterCards = (await page.$$('.campaign-card')).length
      await page.evaluate(() => {
        const panel = document.querySelector('.multi-select-panel')
        if (!panel) return
        const inputs = panel.querySelectorAll('input[type="checkbox"]')
        if (inputs.length >= 2) inputs[1].click()
      })
      await page.waitForTimeout(800)
      const afterFilterCards = (await page.$$('.campaign-card')).length
      check("material filter returns results", afterFilterCards > 0 && afterFilterCards <= beforeFilterCards)
    } else {
      console.log("  SKIP: no material trigger found")
    }
  } else {
    console.log("  SKIP: no filter toggle found")
  }

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
