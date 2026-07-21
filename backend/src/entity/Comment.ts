import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm"

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  resourceId!: string

  @Column()
  userId!: string

  @Column("text")
  content!: string

  @Column({ nullable: true })
  parentId!: string

  @CreateDateColumn()
  createdAt!: Date
}
