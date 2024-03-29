import { Field, ObjectType } from 'type-graphql'
import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity, OneToMany } from 'typeorm'
import { Article } from './Article'
import { GenerativeToken } from './GenerativeToken'
import { Report } from './Report'
import { User } from './User'

/**
 * This table stores the moderation reasons which are used to label moderation
 * actions if needed. Since multiple moderation contracts can have multiple
 * moderation reasons, and IDs can collide, we compose the ID of this table
 * using the reason_id as well as the contract in which it's defined.
 * The ID of each entry is determined as following:
 * {reason_id}-${contract_id}
 */
@Entity()
@ObjectType()
export class ModerationReason extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: string

  @Field()
  @Column()
  reason: string

  @OneToMany(() => User, user => user.moderationReason)
  users: User[]

  @OneToMany(() => GenerativeToken, token => token.moderationReason)
  tokens: GenerativeToken[]

  @OneToMany(() => Article, article => article.moderationReason)
  articles: Article[]

  @OneToMany(() => Report, report => report.reason)
  reports: Report[]
}