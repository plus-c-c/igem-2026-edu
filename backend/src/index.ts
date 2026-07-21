import "reflect-metadata"
import "./config/env"
import express from "express"
import { AppDataSource } from "./config/database"
import authRoutes from "./routes/auth"
import resourceRoutes from "./routes/resource"
import fileRoutes from "./routes/file"
import commentRoutes from "./routes/comment"
import translateRoutes from "./routes/translate"

const app = express()
const PORT = parseInt(process.env.PORT || "3000")

app.use(express.json({ limit: "1mb" }))

app.use("/api/auth", authRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/resources", fileRoutes)
app.use("/api/resources", commentRoutes)
app.use("/api/translate", translateRoutes)

app.get("/", (_req, res) => {
  res.json({ message: "iGEM 2026 Education API" })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("未捕获异常:", err)
  res.status(500).json({ message: "服务器内部错误" })
})

export { AppDataSource }

AppDataSource.initialize()
  .then(() => {
    console.log("数据库连接成功")
    app.listen(PORT, () => {
      console.log(`服务器已启动，端口: ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("数据库连接失败:", error)
    process.exit(1)
  })
