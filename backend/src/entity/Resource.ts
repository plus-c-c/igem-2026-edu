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

  @Column({ nullable: true })
  negotiator!: string

  @Column()
  category!: string

  @Column({ default: "yes" })
  acceptsOthers!: string

  @Column({ nullable: true })
  delivery!: string

  @Column({ nullable: true })
  audience!: string

  @Column({ nullable: true })
  duration!: string

  @Column({ nullable: true })
  location!: string

  @Column({ nullable: true })
  reimbursement!: string

  @Column({ nullable: true })
  contact!: string

  @Column("text")
  desc!: string

  @Column("simple-array", { nullable: true })
  materials!: string[]

  @Column({ default: "normal" })
  type!: string

  @Column({ nullable: true })
  subtitle!: string

  @Column({ nullable: true })
  image!: string

  @Column({ nullable: true })
  format!: string

  @Column({ nullable: true })
  impact!: string

  @Column("json", { nullable: true })
  campaignSteps!: { id: string; text: string; files: { fileId: string; name: string }[] }[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
