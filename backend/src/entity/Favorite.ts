import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from "typeorm"

@Entity()
@Unique(["userId", "resourceId"])
export class Favorite {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  resourceId!: string

  @Column()
  userId!: string

  @CreateDateColumn()
  createdAt!: Date
}
