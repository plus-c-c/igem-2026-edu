import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm"
import { Resource } from "./Resource"
import { User } from "./User"

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Resource)
  @JoinColumn({ name: "resourceId" })
  resource!: Resource

  @Column()
  resourceId!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User

  @Column()
  userId!: string

  @Column("text")
  content!: string

  @Column({ nullable: true })
  parentId!: string

  @CreateDateColumn()
  createdAt!: Date
}
