import {
  Entity,
  Column,
  PrimaryColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
} from "typeorm"
import { User } from "./User"

@Entity()
export class UserStats extends BaseEntity {
  @PrimaryColumn()
  userId: string

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User

  @Column({ type: "bigint", nullable: true })
  primVolumeTz: number | null

  @Column({ type: "bigint", nullable: true })
  primVolumeNb: number | null

  @Column({ type: "bigint", nullable: true })
  primVolumeTz24: number | null

  @Column({ type: "bigint", nullable: true })
  primVolumeNb24: number | null

  @Column({ type: "bigint", nullable: true })
  primVolumeTz7d: number | null

  @Column({ type: "bigint", nullable: true })
  primVolumeNb7d: number | null

  @Column({ type: "bigint", nullable: true })
  primVolumeTz30d: number | null

  @Column({ type: "bigint", nullable: true })
  primVolumeNb30d: number | null

  @Column({ type: "bigint", nullable: true })
  secVolumeTz: number | null

  @Column({ type: "bigint", nullable: true })
  secVolumeNb: number | null

  @Column({ type: "bigint", nullable: true })
  secVolumeTz24: number | null

  @Column({ type: "bigint", nullable: true })
  secVolumeNb24: number | null

  @Column({ type: "bigint", nullable: true })
  secVolumeTz7d: number | null

  @Column({ type: "bigint", nullable: true })
  secVolumeNb7d: number | null

  @Column({ type: "bigint", nullable: true })
  secVolumeTz30d: number | null

  @Column({ type: "bigint", nullable: true })
  secVolumeNb30d: number | null

  @Column({ type: "timestamptz", nullable: true })
  from: Date

  @Column({ type: "timestamptz", nullable: true })
  to: Date
}
