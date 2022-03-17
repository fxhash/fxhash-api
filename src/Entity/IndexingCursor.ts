import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity } from 'typeorm'

/**
 * This Table stores the ID and LEVEL of the last operation indexed for each
 * indexing group. An indexing group is simply a group of contracts indexed
 * together so that the operations made on those contracts are indexed in the
 * right order.
 */
@Entity()
export class IndexingCursor extends BaseEntity {
  @PrimaryColumn()
  groupId: string

  @Column({ type: "bigint", default: 0 })
  level: number
  
  @Column({ type: "bigint", default: 0 })
  id: number
}