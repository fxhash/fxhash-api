import { GraphQLJSONObject } from 'graphql-type-json'
import slugify from 'slugify'
import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Filter, generateFilterType } from 'type-graphql-filter'
import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity, CreateDateColumn, ManyToOne, OneToMany, RelationId, OneToOne } from 'typeorm'
import { GenerativeTokenMetadata } from '../types/Metadata'
import { Action } from './Action'
import { MarketStats } from './MarketStats'
import { MarketStatsHistory } from './MarketStatsHistory'
import { Objkt } from './Objkt'
import { Report } from './Report'
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

export enum GenMintProgressFilter {
  COMPLETED   = "COMPLETED",
  ONGOING     = "ONGOING",
  ALMOST      = "ALMOST",
}

registerEnumType(GenMintProgressFilter, {
  name: "GenMintProgressFilter", // this one is mandatory
  description: "Filter for the progress of the mint", // this one is optional
})

@Entity()
@ObjectType()
export class GenerativeToken extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  slug?: string
  
  @Field(() => GenTokFlag)
  @Column({
    type: "enum",
    enum: GenTokFlag,
    default: GenTokFlag.NONE
  })
  flag: GenTokFlag

  @OneToMany(() => Report, report => report.token)
  reports: Report[]

  @ManyToOne(() => User, user => user.generativeTokens)
  author?: User

	@RelationId((token: GenerativeToken) => token.author)
	authorId: number

  @Field()
  @Column({ nullable: true })
  name: string

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: "json", nullable: true })
  metadata: GenerativeTokenMetadata

  @Field({ nullable: true })
  @Column({ nullable: true })
  metadataUri?: string

  @Field(() => [String],{ nullable: true })
  @Column("text", { nullable: true, array: true })
  tags: string[]

  @Field()
  @Column({ default: 0 })
  @Filter([ "lte", "gte" ], type => Number)
  price: number = 0

  @Field()
  @Column({ default: 0 })
  originalSupply: number = 0

  @Field()
  @Column({ default: 0 })
  @Filter([ "lte", "gte" ], type => Number)
  supply: number = 0

  @Field()
  @Column({ default: 0 })
  balance: number = 0

  @Field()
  @Column({ default: false })
  enabled: boolean = false

  @Field()
  @Column({ default: 0 })
  royalties: number = 0

  @Field()
  @Column({ default: 0 })
  lockedSeconds: number = 0

  @Field()
  @Column({ type: "timestamptz", nullable: true })
  lockEnd: Date

  @OneToMany(() => Objkt, objkt => objkt.issuer)
  objkts: Objkt[]

  @OneToMany(() => Action, action => action.token)
  actions: Action[]

  @OneToOne(() => MarketStats, stats => stats.token)
  marketStats: MarketStats

  @OneToMany(() => MarketStatsHistory, stats => stats.token)
  marketStatsHistory: MarketStatsHistory

  @Field()
  @CreateDateColumn({ type: 'timestamptz', transformer: DateTransformer })
  createdAt: string

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', nullable: true, transformer: DateTransformer })
  updatedAt: string

  @Field()
  objktsCount: number

  @Field(type => [Objkt], { nullable: true })
  offers: Objkt[]

  //
  // FILTERS FOR THE GQL ENDPOINT
  //

  @Filter([ "eq" ], type => GenMintProgressFilter)
  mintProgress: "completed"|"ongoing"|"almost"

  @Filter([ "eq" ], type => Boolean)
  authorVerified: Boolean

  @Filter([ "eq" ], type => String)
  searchQuery: string
}

export const GenerativeFilters = generateFilterType(GenerativeToken)