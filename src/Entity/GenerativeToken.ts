import { GraphQLJSONObject } from 'graphql-type-json'
import slugify from 'slugify'
import { Field, Int, ObjectType, registerEnumType } from 'type-graphql'
import { Filter, generateFilterType } from 'type-graphql-filter'
import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity, CreateDateColumn, ManyToOne, OneToMany, RelationId, OneToOne } from 'typeorm'
import { GenMintProgressFilter } from '../types/GenerativeToken'
import { GenerativeTokenMetadata } from '../types/Metadata'
import { Action } from './Action'
import { MarketStats } from './MarketStats'
import { MarketStatsHistory } from './MarketStatsHistory'
import { ModerationReason } from './ModerationReason'
import { Objkt } from './Objkt'
import { PricingDutchAuction } from './PricingDutchAuction'
import { PricingFixed } from './PricingFixed'
import { Report } from './Report'
import { Split } from './Split'
import { Transaction } from './Transaction'
import { DateTransformer } from './Transformers/DateTransformer'
import { User } from './User'


export enum GenTokFlag {
  NONE              = "NONE",
  CLEAN             = "CLEAN",
  REPORTED          = "REPORTED",
  AUTO_DETECT_COPY  = "AUTO_DETECT_COPY",
  MALICIOUS         = "MALICIOUS",
  HIDDEN            = "HIDDEN",
}

registerEnumType(GenTokFlag, {
  name: "GenTokFlag", // this one is mandatory
  description: "Flag state of Generative Token", // this one is optional
})

@Entity()
@ObjectType({
  description: "A Generative Token is a project published by artist(s), responsible for generating unique iterations (gentk)"
})
export class GenerativeToken extends BaseEntity {
  @Field({
    description: "The ID of the Generative Token, matches the blockchain storage"
  })
  @PrimaryColumn()
  id: number

  @Field({
    description: "URL-friendly unique string identifier to reference the Generative Token. Computed on-the-fly by the indexer.",
  })
  @Column({ nullable: true })
  slug: string
  
  @Field(() => GenTokFlag, {
    description: "Generative Tokens can be reported or moderated and their moderation state will reflect in this property."
  })
  @Column({
    type: "enum",
    enum: GenTokFlag,
    default: GenTokFlag.NONE
  })
  flag: GenTokFlag

  @OneToMany(() => Report, report => report.token)
  reports: Report[]

  @ManyToOne(() => ModerationReason, reason => reason.tokens, { 
    nullable: true 
  })
  moderationReason?: ModerationReason

  @ManyToOne(() => User, user => user.generativeTokens)
  author?: User

	@Column()
	authorId: number

  @Field({
    description: "The name of the Generative Token, as defined in the JSON metadata created with the token when published on the blockchain"
  })
  @Column({ nullable: true })
  name: string

  @Field(() => GraphQLJSONObject, {
    nullable: true,
    description: "The JSON metadata of the Generative Token, loaded from the ipfs uri associated with the token when published",
  })
  @Column({ type: "json", nullable: true })
  metadata: GenerativeTokenMetadata

  @Field({ 
    nullable: true,
    description: "IPFS uri pointing to the JSON metadata of the Generative Token"
  })
  @Column({ nullable: true })
  metadataUri?: string

  @Field(() => [String], {
    nullable: true,
    description: "A list of tags as defined by the artist(s) when published. Can be used to better reference the project.",
  })
  @Column("text", { nullable: true, array: true })
  tags: string[]

  @Field(type => [Int], {
    description: "A list of int identifiers defining some properties of a Generative Token. Can be set by artist(s) at mint time and can be upadted by moderators on-chain if needed.",
  })
  @Column({
    type: "smallint",
    array: true,
    default: [],
  })
  labels: number[]

  @OneToOne(() => PricingFixed, pricing => pricing.token, {
    nullable: true,
  })
  pricingFixed: PricingFixed
  
  @OneToOne(() => PricingDutchAuction, pricing => pricing.token, {
    nullable: true,
  })
  pricingDutchAuction: PricingDutchAuction

  @OneToMany(() => Split, split => split.generativeTokenPrimary)
  splitsPrimary: Split[]

  @OneToMany(() => Split, split => split.generativeTokenSecondary)
  splitsSecondary: Split[]

  @Field({
    description: "The initial supply, as defined by artist(s) when publishing the Generative Token",
  })
  @Column({ default: 0 })
  originalSupply: number = 0

  @Field({
    description: "The current supply, some editions can be burnt by the artist(s) and in that case this number will be smaller than *originalSupply*"
  })
  @Column({ default: 0 })
  @Filter([ "lte", "gte" ], type => Number)
  supply: number = 0

  @Field({
    description: "The balance left (the number of iterations still mintable). When 0, the Generative Token cannot be used to generate new iterations."
  })
  @Column({ default: 0 })
  balance: number = 0

  @Field({
    description: "If the minting of the Generative Token is enabled or not. Can be changed by artist(s) only onchain."
  })
  @Column({ default: false })
  enabled: boolean = false

  @Field({
    description: "The current royalties which will be attributed to the iterations minted from this token. Can be updated by artist(s). Per thousands (divide by 10 to get percentage)."
  })
  @Column({ default: 0 })
  royalties: number = 0

  @Field({
    description: "The number of seconds during which the Generative Token is locked after it was published. Verified users will have 0 lockedSeconds."
  })
  @Column({ default: 0 })
  lockedSeconds: number = 0

  @Field({
    description: "When will the lock of the token ends. Is defined by *createdAt* + *lockedSeconds*"
  })
  @Column({ type: "timestamptz", nullable: true })
  lockEnd: Date

  @OneToMany(() => Objkt, objkt => objkt.issuer)
  objkts: Objkt[]

  @OneToMany(() => Action, action => action.token)
  actions: Action[]

  @OneToMany(() => Transaction, transaction => transaction.objkt)
  transactions: Transaction[]

  @OneToOne(() => MarketStats, stats => stats.token)
  marketStats: MarketStats

  @OneToMany(() => MarketStatsHistory, stats => stats.token)
  marketStatsHistory: MarketStatsHistory

  @Field()
  @Column({ type: 'timestamptz', transformer: DateTransformer })
  createdAt: string

  @Field()
  @Column({ 
    type: 'timestamptz',
    nullable: true,
    transformer: DateTransformer,
  })
  updatedAt: string

  //
  // FILTERS FOR THE GQL ENDPOINT
  //

  @Filter([ "eq" ], type => GenMintProgressFilter)
  mintProgress: "completed"|"ongoing"|"almost"

  @Filter([ "eq" ], type => Boolean)
  authorVerified: Boolean

  @Filter([ "eq" ], type => String)
  searchQuery: string

  @Filter([ "lte", "gte" ], type => Int)
  price: number
}

export const GenerativeFilters = generateFilterType(GenerativeToken)