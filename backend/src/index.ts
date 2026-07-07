import "reflect-metadata"
import dotenv from "dotenv"
import path from "path"
dotenv.config({ path: path.resolve(__dirname, "../.env") })

import express from "express"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Resource } from "./entity/Resource"
import { UploadedFile } from "./entity/File"
import { Comment } from "./entity/Comment"
import { CommentLike } from "./entity/CommentLike"
import { Favorite } from "./entity/Favorite"
import { ResourceLike } from "./entity/ResourceLike"
import authRoutes from "./routes/auth"
import resourceRoutes from "./routes/resource"
import fileRoutes from "./routes/file"
import commentRoutes from "./routes/comment"

const DB_HOST = process.env.DB_HOST || "localhost"
const DB_PORT = parseInt(process.env.DB_PORT || "5432")
const DB_USER = process.env.DB_USERNAME || "postgres"
const DB_PASS = process.env.DB_PASSWORD || "postgres"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASS,
  database: process.env.DB_DATABASE || "igem_education",
  synchronize: true,
  logging: true,
  entities: [User, Resource, UploadedFile],
})

export const CommentDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASS,
  database: process.env.COMMENTS_DB_NAME || "igem_comments",
  synchronize: true,
  logging: true,
  entities: [Comment, CommentLike, Favorite, ResourceLike],
})

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

async function ensureCommentsDb() {
  const tempDs = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASS,
    database: "postgres",
  })
  await tempDs.initialize()
  const dbName = process.env.COMMENTS_DB_NAME || "igem_comments"
  await tempDs.query(`CREATE DATABASE "${dbName}"`).catch(() => {})
  await tempDs.destroy()
}

ensureCommentsDb()
  .then(() => AppDataSource.initialize())
  .then(() => CommentDataSource.initialize())
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
