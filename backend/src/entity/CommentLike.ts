import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm"
import { Comment } from "./Comment"
import { User } from "./User"

@Entity()
@Unique(["userId", "commentId"])
export class CommentLike {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Comment)
  @JoinColumn({ name: "commentId" })
  comment!: Comment

  @Column()
  commentId!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User

  @Column()
  userId!: string

  @CreateDateColumn()
  createdAt!: Date
}
