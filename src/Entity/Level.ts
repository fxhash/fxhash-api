import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity } from 'typeorm'

@Entity()
export class Level extends BaseEntity {
  @PrimaryColumn()
  hash: string

  @Column({ type: "bigint", default: 0 })
  level: number

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date
}