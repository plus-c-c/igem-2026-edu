import { DataSource } from "typeorm"
import { User } from "../entity/User"
import { Resource } from "../entity/Resource"
import { UploadedFile } from "../entity/File"
import { Comment } from "../entity/Comment"
import { CommentLike } from "../entity/CommentLike"
import { Favorite } from "../entity/Favorite"
import { ResourceLike } from "../entity/ResourceLike"

function getDbConfig() {
  return {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
  }
}

export function createMainDataSource(logging = true) {
  const { host, port, username, password } = getDbConfig()
  return new DataSource({
    type: "postgres",
    host,
    port,
    username,
    password,
    database: process.env.DB_DATABASE!,
    synchronize: true,
    logging,
    entities: [User, Resource, UploadedFile],
  })
}

export function createCommentDataSource(logging = true) {
  const { host, port, username, password } = getDbConfig()
  return new DataSource({
    type: "postgres",
    host,
    port,
    username,
    password,
    database: process.env.COMMENTS_DB_NAME!,
    synchronize: true,
    logging,
    entities: [Comment, CommentLike, Favorite, ResourceLike],
  })
}

function createTempDataSource() {
  const { host, port, username, password } = getDbConfig()
  return new DataSource({
    type: "postgres",
    host,
    port,
    username,
    password,
    database: "postgres",
  })
}

export async function ensureCommentsDb() {
  const tempDs = createTempDataSource()
  await tempDs.initialize()
  const dbName = process.env.COMMENTS_DB_NAME!
  await tempDs.query(`CREATE DATABASE "${dbName}"`).catch(() => {})
  await tempDs.destroy()
}

export const AppDataSource = createMainDataSource()
export const CommentDataSource = createCommentDataSource()
