import "reflect-metadata"
import "./config/env"
import express from "express"
import { AppDataSource } from "./config/database"
import authRoutes from "./routes/auth"
import resourceRoutes from "./routes/resource"
import fileRoutes from "./routes/file"
import commentRoutes from "./routes/comment"

const app = express()
const PORT = parseInt(process.env.PORT || "3000")

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/resources", fileRoutes)
app.use("/api/resources", commentRoutes)

app.get("/", (_req, res) => {
  res.json({ message: "iGEM 2026 Education API" })
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
