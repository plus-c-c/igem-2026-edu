import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm"
import { Resource } from "./Resource"

@Entity()
export class UploadedFile {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @ManyToOne(() => Resource)
  @JoinColumn({ name: "resourceId" })
  resource!: Resource

  @Column()
  resourceId!: string

  @Column()
  originalName!: string

  @Column()
  storedName!: string

  @Column()
  mimeType!: string

  @Column()
  size!: number

  @Column({ nullable: true })
  materialLabel!: string

  @CreateDateColumn()
  createdAt!: Date
}
