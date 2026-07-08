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

  // 活动信息
  @Column({ nullable: true })
  canParticipate!: string

  @Column({ nullable: true })
  locationType!: string

  @Column({ nullable: true })
  locationCountry!: string

  @Column({ nullable: true })
  locationProvince!: string

  @Column({ nullable: true })
  locationCity!: string

  @Column({ nullable: true })
  eventDate!: string

  @Column({ nullable: true })
  timeLimitType!: string

  @Column({ nullable: true })
  timeRangeStart!: string

  @Column({ nullable: true })
  timeRangeEnd!: string

  // 项目Tips
  @Column("text", { nullable: true })
  tips!: string

  // 现场照片
  @Column({ nullable: true })
  sitePhotosFormat!: string

  @Column({ nullable: true })
  sitePhotoIds!: string

  // 项目介绍书
  @Column("text", { nullable: true })
  introductionContent!: string

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

  @Column({ default: "draft" })
  status!: string

  @Column({ nullable: true })
  originalId!: string

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
