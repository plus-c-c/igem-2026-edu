import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { User } from "./User"

@Entity()
export class Resource {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User

  @Column()
  userId!: string

  @Column()
  team!: string

  @Column()
  title!: string

  @Column()
  negotiator!: string

  @Column()
  category!: string

  @Column({ default: "yes" })
  acceptsOthers!: string

  @Column()
  delivery!: string

  @Column()
  audience!: string

  @Column({ nullable: true })
  duration!: string

  @Column()
  location!: string

  @Column()
  reimbursement!: string

  @Column()
  contact!: string

  @Column("text")
  desc!: string

  @Column("simple-array", { nullable: true })
  materials!: string[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
