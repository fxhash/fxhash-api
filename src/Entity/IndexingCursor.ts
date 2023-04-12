import { Field, ObjectType } from 'type-graphql'
import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity } from 'typeorm'

/**
 * This Table stores the ID and LEVEL of the last operation indexed for each
 * indexing group. An indexing group is simply a group of contracts indexed
 * together so that the operations made on those contracts are indexed in the
 * right order.
 */
@Entity()
@ObjectType({
  description: "A cursor which represents the current position of the indexer (and so the state of the database)"
})
export class IndexingCursor extends BaseEntity {
  @PrimaryColumn()
  groupId: string

  @Field({
    description: "Block level"
  })
  @Column({ type: "bigint", default: 0 })
  level: number
  
  @Field({
    description: "Operation index"
  })
  @Column({ type: "bigint", default: 0 })
  id: number

  @Field({
    description: "When the first contract of the group was originated"
  })
  @Column({ type: "timestamptz", nullable: false })
  originatedAt: Date

  @Field({
    description: "When the last operation was indexed"
  })
  @Column({ type: "timestamptz", nullable: false })
  lastIndexedAt: Date
}