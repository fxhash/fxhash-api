import { Field, ObjectType } from 'type-graphql'
import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity, PrimaryGeneratedColumn, OneToMany, ManyToOne, Index } from 'typeorm'
import { GenerativeToken } from './GenerativeToken'
import { Objkt } from './Objkt'
import { User } from './User'

/**
 * A Split defines a % of the shares owned by a user 
 */
@Entity()
@ObjectType({
  description: "Describes a generic split (ie: how much shares belong to a given user in any context)."
})
export class Split extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Field({
    description: "The per-thousands value associated with the split. Divide by 10 to get percentage.",
  })
  @Column()
  pct: number

  @ManyToOne(() => User, user => user.splits)
  user: User

  @Column()
  userId: string

  @Index()
  @ManyToOne(() => GenerativeToken, token => token.splitsPrimary, {
    onDelete: "CASCADE",
  })
  generativeTokenPrimary: GenerativeToken

  @Column()
  generativeTokenPrimaryId: number
  
  @Index()
  @ManyToOne(() => GenerativeToken, token => token.splitsSecondary)
  generativeTokenSecondary: GenerativeToken

  @Column()
  generativeTokenSecondaryId: number

  @Index()
  @ManyToOne(() => Objkt, token => token.royaltiesSplit)
  objkt: Objkt

  @Column()
  objktId: number
}