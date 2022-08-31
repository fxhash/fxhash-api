import { GraphQLJSONObject } from 'graphql-type-json'
import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Filter, generateFilterType } from 'type-graphql-filter'
import { Entity, Column, PrimaryColumn, BaseEntity, OneToMany, ManyToOne } from 'typeorm'
import { Action } from './Action'
import { Article } from './Article'
import { ArticleLedger } from './ArticleLedger'
import { Collaboration } from './Collaboration'
import { GenerativeToken } from './GenerativeToken'
import { Listing } from './Listing'
import { ModerationReason } from './ModerationReason'
import { Objkt } from './Objkt'
import { Offer } from './Offer'
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

export enum UserAuthorization {
  TOKEN_MODERATION          = "TOKEN_MODERATION",
  ARTICLE_MODERATION        = "ARTICLE_MODERATION",
  USER_MODERATION           = "USER_MODERATION",
  GOVERNANCE_MODERATION     = "GOVERNANCE_MODERATION",
}
registerEnumType(UserAuthorization, {
  name: "UserAuthorization",
  description: "Some users have granular authorizations to perform certain moderation actions on the contracts."
})


@Entity()
@ObjectType({
  description: "Polymorphic entity which globally describes regular users (who had at least one interaction with fxhash contracts) or contract entities such as a collaboration contract."
})
export class User extends BaseEntity {
  @Field({
    description: "The unique identifier (tezos address) of the user."
  })
  @Filter([ "in" ])
  @PrimaryColumn()
  id: string

  @Field({ 
    nullable: true,
    description: "The name of the user, as it was set in the fxhash user register contract by the user."
  })
  @Column({ nullable: true })
  name?: string

  @Field(() => UserType, {
    description: "The type of account. The User entity is a polymorphic entity which both support regular users and \"contract\" users. For instance, if this field returns `COLLAB_CONTRACT_V1`, it means that the account in question is a collaboration contract controlled by the users found in the `collaborators` field."
  })
  @Column({
    type: "enum",
    enum: UserType,
    default: UserType.REGULAR,
  })
  type: UserType

  // Collaboration-related fields
  // as a COLLABORATION_CONTRACT, a User will have a list of collaborators
  @OneToMany(() => Collaboration, collab => collab.collaborator)
  collaborators: Collaboration[]
  
  // as a REGULAR_USER, which is part of any number of collaboration contracts,
  // a User will have a list of collaboration contracts
  @OneToMany(() => Collaboration, collab => collab.collaborationContract)
  collaborationContracts: Collaboration[]

  @OneToMany(() => Article, article => article.author)
  articles: Article[]

  @OneToMany(() => ArticleLedger, ledger => ledger.owner)
  articlesLedger: ArticleLedger[]

  @Column({
    type: "smallint",
    array: true,
    default: [],
  })
  authorizations: number[]
  
  @Field(() => UserFlag, {
    description: "If any, the flag that was set by the moderation team. Verified users will have a `VERIFIED` flag."
  })
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

  @Field(() => GraphQLJSONObject, { 
    nullable: true,
    description: "The metadata of the user in JSON, extracted from IPFS as they saved it on the fxhash user register contract. *Please use individual fields if possible as it makes cheaper responses*."
  })
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>

  @Field({
    nullable: true,
    description: "The IPFS uri pointing to the given user metadata."
  })
  @Column({ nullable: true })
  metadataUri: string

  @Field({
    nullable: true,
    description: "The description of the user, as set in the IPFS json metadata associated to the user on the fxhash user register contract."
  })
  @Column({ nullable: true })
  description: string

  @Field({ 
    nullable: true,
    description: "The IPFS uri pointing to the avatar of the user as set in the json metadata associated to the user on the fxhash user register contract."
  })
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

  @OneToMany(() => Objkt, objkt => objkt.minter)
  objktsMinted: Objkt[]

  @OneToMany(() => Listing, listing => listing.issuer)
  listings: Listing[]

  @OneToMany(() => Offer, offer => offer.buyer)
  offers: Offer[]

  @OneToMany(() => Report, report => report.user)
  reports: Report[]

  @OneToMany(() => Split, split => split.user)
  splits: Split[]

  @Field({
    description: "The time at which this user first interacted with one of the indexed fxhash contracts."
  })
  @Column({ type: "timestamptz", transformer: DateTransformer })
  createdAt: string

  @Column({ type: "timestamptz", transformer: DateTransformer })
  updatedAt: string


  //
  // CUSTOM FILTERS
  //

  @Filter([ "eq" ], type => String)
  searchQuery: string
}

export const UserFilters = generateFilterType(User)