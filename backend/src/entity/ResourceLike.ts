import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from "typeorm"

@Entity()
@Unique(["userId", "resourceId"])
export class ResourceLike {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  resourceId!: string

  @Column()
  userId!: string

  @CreateDateColumn()
  createdAt!: Date
}
