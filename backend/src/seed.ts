import "reflect-metadata"
import dotenv from "dotenv"
import path from "path"
dotenv.config({ path: path.resolve(__dirname, "../.env") })

import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Resource } from "./entity/Resource"
import { UploadedFile } from "./entity/File"

async function seed() {
  const ds = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "igem_education",
    synchronize: true,
    logging: false,
    entities: [User, Resource, UploadedFile],
  })

  await ds.initialize()
  console.log("数据库连接成功")

  const userRepo = ds.getRepository(User)

  const existing = await userRepo.findOneBy({ email: "admin@igem-education.com" })
  if (existing) {
    console.log("管理员账号已存在，跳过")
  } else {
    const admin = userRepo.create({
      email: "admin@igem-education.com",
      password: "devAdmin123!",
      name: "管理员",
      role: "admin",
    })
    await userRepo.save(admin)
    console.log("管理员账号创建成功: admin@igem-education.com / devAdmin123!")
  }

  await ds.destroy()
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed 失败:", err)
  process.exit(1)
})
