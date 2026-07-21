import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from "typeorm"

@Entity()
@Unique(["userId", "commentId"])
export class CommentLike {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  commentId!: string

  @Column()
  userId!: string

  @CreateDateColumn()
  createdAt!: Date
}
