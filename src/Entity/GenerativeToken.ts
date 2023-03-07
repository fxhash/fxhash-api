import { GraphQLJSONObject } from "graphql-type-json"
import { Field, Int, ObjectType, registerEnumType } from "type-graphql"
import { Filter, generateFilterType } from "type-graphql-filter"
import {
  Entity,
  Column,
  PrimaryColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm"
import { TokenId } from "../Scalar/TokenId"
import {
  GenerativeTokenVersion,
  GenMintProgressFilter,
} from "../types/GenerativeToken"
import { GenerativeTokenMetadata } from "../types/Metadata"
import { FxParamDefinition } from "../types/Params"
import { Action } from "./Action"
import { ArticleGenerativeToken } from "./ArticleGenerativeToken"
import { Codex } from "./Codex"
import { CodexUpdateRequest } from "./CodexUpdateRequest"
import { MarketStats } from "./MarketStats"
import { MarketStatsHistory } from "./MarketStatsHistory"
import { MediaImage } from "./MediaImage"
import { MintTicket } from "./MintTicket"
import { MintTicketSettings } from "./MintTicketSettings"
import { ModerationReason } from "./ModerationReason"
import { Objkt } from "./Objkt"
import { PricingDutchAuction } from "./PricingDutchAuction"
import { PricingFixed } from "./PricingFixed"
import { Redeemable } from "./Redeemable"
import { Report } from "./Report"
import { Reserve } from "./Reserve"
import { Split } from "./Split"
import { Transaction } from "./Transaction"
import { DateTransformer } from "./Transformers/DateTransformer"
import { User } from "./User"

export enum GenTokFlag {
  NONE = "NONE",
  CLEAN = "CLEAN",
  REPORTED = "REPORTED",
  AUTO_DETECT_COPY = "AUTO_DETECT_COPY",
  MALICIOUS = "MALICIOUS",
  HIDDEN = "HIDDEN",
}
registerEnumType(GenTokFlag, {
  name: "GenTokFlag",
  description: "Flag state of Generative Token",
})

export enum GentkTokPricing {
  FIXED = "FIXED",
  DUTCH_AUCTION = "DUTCH_AUCTION",
}
registerEnumType(GentkTokPricing, {
  name: "GenTokPricing",
  description: "The pricing method used by the Generative Token",
})

@Entity()
@ObjectType({
  description:
    "A Generative Token is a project published by artist(s), responsible for generating unique iterations (gentk)",
})
export class GenerativeToken extends BaseEntity {
  @PrimaryColumn()
  @Filter(["in"], () => TokenId)
  id: number

  // no need to expose the version to the API
  @Column({
    primary: true,
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
    default: GenerativeTokenVersion.PRE_V3,
  })
  version: GenerativeTokenVersion

  @Field({
    description:
      "URL-friendly unique string identifier to reference the Generative Token. Computed on-the-fly by the indexer.",
  })
  @Column({ nullable: true })
  slug: string

  @Field(() => GenTokFlag, {
    description:
      "Generative Tokens can be reported or moderated and their moderation state will reflect in this property.",
  })
  @Column({
    type: "enum",
    enum: GenTokFlag,
    default: GenTokFlag.NONE,
  })
  @Filter(["eq", "in", "ne"], () => GenTokFlag)
  flag: GenTokFlag

  @OneToMany(() => Report, report => report.token)
  reports: Report[]

  @ManyToOne(() => ModerationReason, reason => reason.tokens, {
    nullable: true,
  })
  moderationReason?: ModerationReason

  @Column()
  moderationReasonId: string

  @ManyToOne(() => User, user => user.generativeTokens)
  author?: User

  @Column()
  authorId: number

  @Field({
    description:
      "The name of the Generative Token, as defined in the JSON metadata created with the token when published on the blockchain",
  })
  @Column({ nullable: true })
  name: string

  @Field(() => GraphQLJSONObject, {
    nullable: true,
    description:
      "The JSON metadata of the Generative Token, loaded from the ipfs uri associated with the token when published",
  })
  @Column({ type: "json", nullable: true })
  metadata: GenerativeTokenMetadata

  @Field(() => [GraphQLJSONObject], {
    nullable: true,
    description: "The JSON fx(params) definition for project using params",
  })
  @Column({ type: "json", nullable: true })
  paramsDefinition?: FxParamDefinition[]

  @Field({
    nullable: true,
    description:
      "IPFS uri pointing to the JSON metadata of the Generative Token",
  })
  @Column({ nullable: true })
  metadataUri?: string

  @Column({ nullable: true })
  codexId: number

  @ManyToOne(() => Codex)
  @JoinColumn([
    { name: "codexId", referencedColumnName: "id" },
    { name: "version", referencedColumnName: "tokenVersion" },
  ])
  codex: Codex

  @OneToOne(() => CodexUpdateRequest, updateRequest => updateRequest.token, {
    nullable: true,
  })
  codexUpdateRequest: CodexUpdateRequest

  @Field({
    nullable: true,
    description:
      "IPFS uri pointing to the web page hosting the Generator code. **Can be used to display generated gentks**",
  })
  @Column({ nullable: true })
  generativeUri?: string

  @Field({
    nullable: true,
    description:
      "IPFS uri pointing to the 300x300 (contained) thumbnail of the project",
  })
  @Column({ nullable: true })
  thumbnailUri?: string

  @Field({
    nullable: true,
    description: "IPFS uri pointing to the full res image of the project",
  })
  @Column({ nullable: true })
  displayUri?: string

  @ManyToOne(() => MediaImage)
  @JoinColumn({ name: "captureMediaId", referencedColumnName: "cid" })
  captureMedia?: MediaImage

  @Column()
  captureMediaId: string

  @Field(() => [String], {
    nullable: true,
    description:
      "A list of tags as defined by the artist(s) when published. Can be used to better reference the project.",
  })
  @Column("text", { nullable: true, array: true })
  tags: string[]

  @Field(type => [Int], {
    description:
      "A list of int identifiers defining some properties of a Generative Token. Can be set by artist(s) at mint time and can be upadted by moderators on-chain if needed.",
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

  @OneToMany(() => Reserve, reserve => reserve.token)
  reserves: Reserve[]

  @Field({
    description:
      "The initial supply, as defined by artist(s) when publishing the Generative Token",
  })
  @Column({ default: 0 })
  originalSupply: number = 0

  @Field({
    description:
      "The current supply, some editions can be burnt by the artist(s) and in that case this number will be smaller than *originalSupply*",
  })
  @Column({ default: 0 })
  @Filter(["lte", "gte"], type => Number)
  supply: number = 0

  @Field({
    description:
      "The balance left (the number of iterations still mintable). When 0, the Generative Token cannot be used to generate new iterations.",
  })
  @Column({ default: 0 })
  balance: number = 0

  @Field({
    description:
      "If the minting of the Generative Token is enabled or not. Can be changed by artist(s) only onchain.",
  })
  @Column({ default: false })
  enabled: boolean = false

  @Field({
    description:
      "The current royalties which will be attributed to the iterations minted from this token. Can be updated by artist(s). Per thousands (divide by 10 to get percentage).",
  })
  @Column({ default: 0 })
  royalties: number = 0

  @Field({
    description:
      "The number of seconds during which the Generative Token is locked after it was published. Verified users will have 0 lockedSeconds.",
  })
  @Column({ default: 0 })
  lockedSeconds: number = 0

  @Field({
    description:
      "When will the lock of the token ends. Is defined by *createdAt* + *lockedSeconds*",
  })
  @Column({ type: "timestamptz" })
  lockEnd: Date

  @Field({
    description:
      "When the token will be available for minting. Is defined by max(lockEnd, pricing.opensAt)",
  })
  @Column({ type: "timestamptz" })
  mintOpensAt: Date

  @Field({
    description: "Whether the token has open editions or not.",
  })
  @Column()
  openEditions: boolean

  @Field(() => Date, {
    description:
      "For tokens with open editions - indicates when the open editions end. Null if the open editions never end.",
    nullable: true,
  })
  @Column({
    type: "timestamptz",
    nullable: true,
  })
  openEditionsEndsAt: Date | null

  @Field({
    description:
      "The number of bytes required to mint an iteration of the project (if 0, no fxparams)",
  })
  @Column()
  inputBytesSize: number = 0

  @OneToOne(
    () => MintTicketSettings,
    mintTicketSettings => mintTicketSettings.token,
    { nullable: true }
  )
  mintTicketSettings: MintTicketSettings

  @OneToMany(() => MintTicket, mintTicket => mintTicket.token)
  mintTickets: MintTicket[]

  @OneToMany(() => Objkt, objkt => objkt.issuer)
  objkts: Objkt[]

  @OneToMany(() => Action, action => action.token)
  actions: Action[]

  @OneToMany(() => ArticleGenerativeToken, jointure => jointure.generativeToken)
  articleJointures: ArticleGenerativeToken[]

  @OneToMany(() => Transaction, transaction => transaction.objkt)
  transactions: Transaction[]

  @OneToOne(() => MarketStats, stats => stats.token)
  marketStats: MarketStats

  @OneToMany(() => MarketStatsHistory, stats => stats.token)
  marketStatsHistory: MarketStatsHistory

  @OneToMany(() => Redeemable, redeemable => redeemable.token)
  redeemables: Redeemable[]

  @Field()
  @Column({ type: "timestamptz", transformer: DateTransformer })
  createdAt: string

  @Field()
  @Column({
    type: "timestamptz",
    nullable: true,
    transformer: DateTransformer,
  })
  updatedAt: string

  //
  // FILTERS FOR THE GQL ENDPOINT
  //

  @Filter(["eq"], type => GenMintProgressFilter)
  mintProgress: "completed" | "ongoing" | "almost"

  @Filter(["eq"], type => Boolean)
  authorVerified: Boolean

  @Filter(["eq"], type => String)
  searchQuery: string

  @Filter(["lte", "gte"], type => Int)
  price: number

  @Filter(["eq"], () => GentkTokPricing)
  pricingMethod: GentkTokPricing

  @Filter(["eq"], type => Boolean)
  locked: boolean

  @Filter(["eq"], type => Boolean)
  mintOpened: boolean
}

export const GenerativeFilters = generateFilterType(GenerativeToken)
