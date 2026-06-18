import "reflect-metadata"
import dotenv from "dotenv"
import path from "path"
dotenv.config({ path: path.resolve(__dirname, "../.env") })

import express from "express"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import authRoutes from "./routes/auth"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "igem_education",
  synchronize: true,
  logging: true,
  entities: [User],
})

const app = express()
const PORT = parseInt(process.env.PORT || "3000")

app.use(express.json())

app.use("/api/auth", authRoutes)

app.get("/", (_req, res) => {
  res.json({ message: "iGEM 2026 Education API" })
})

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
