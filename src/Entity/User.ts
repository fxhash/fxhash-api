import { GraphQLString } from 'graphql'
import { GraphQLJSONObject } from 'graphql-type-json'
import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Entity, Column, PrimaryColumn, BaseEntity, OneToMany, ManyToOne } from 'typeorm'
import { Action } from './Action'
import { GenerativeToken } from './GenerativeToken'
import { Listing } from './Listing'
import { ModerationReason } from './ModerationReason'
import { Objkt } from './Objkt'
import { Report } from './Report'
import { Split } from './Split'
import { DateTransformer } from './Transformers/DateTransformer'


export enum UserFlag {
  NONE          = "NONE",
  REVIEW        = "REVIEW",
  SUSPICIOUS    = "SUSPICIOUS",
  MALICIOUS     = "MALICIOUS", 
  VERIFIED      = "VERIFIED",
}
registerEnumType(UserFlag, {
  name: "UserFlag",
  description: "Flag of the user",
})

export enum UserType {
  REGULAR               = "REGULAR",
  COLLAB_CONTRACT_V1    = "COLLAB_CONTRACT_V1"
}
registerEnumType(UserType, {
  name: "UserType",
  description: "What type of entity is this user (regular, collab... etc)",
})


@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string

  @Field(() => UserType)
  @Column({
    type: "enum",
    enum: UserType,
    default: UserType.REGULAR,
  })
  type: UserType

  @Column({
    type: "smallint",
    array: true,
    default: [],
  })
  authorizations: number[]
  
  @Field(() => UserFlag)
  @Column({
    type: "enum",
    enum: UserFlag,
    default: UserFlag.NONE
  })
  flag: UserFlag

  @ManyToOne(() => ModerationReason, reason => reason.users, { 
    nullable: true 
  })
  moderationReason?: ModerationReason

  @Column()
  moderationReasonId?: number

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>

  @Field({ nullable: true })
  @Column({ nullable: true })
  metadataUri: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatarUri: string

  @OneToMany(() => GenerativeToken, token => token.author)
  generativeTokens: GenerativeToken[]

  @OneToMany(() => Action, action => action.issuer)
  actionsAsIssuer: Action[]

  @OneToMany(() => Action, action => action.target)
  actionsAsTarget: Action[]

  @OneToMany(() => Objkt, objkt => objkt.owner)
  objkts: Objkt[]

  @OneToMany(() => Listing, listing => listing.issuer)
  listings: Listing[]

  @OneToMany(() => Report, report => report.user)
  reports: Report[]

  @OneToMany(() => Split, split => split.user)
  splits: Split[]

  @Field()
  @Column({ type: "timestamptz", transformer: DateTransformer })
  createdAt: string

  @Field()
  @Column({ type: "timestamptz", transformer: DateTransformer })
  updatedAt: string
}