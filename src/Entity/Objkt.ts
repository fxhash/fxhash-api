import { GraphQLJSONObject } from "graphql-type-json"
import slugify from "slugify"
import {
  createUnionType,
  Field,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql"
import { generateFilterType, Filter } from "type-graphql-filter"
import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  RelationId,
  JoinColumn,
} from "typeorm"
import { TokenId } from "../Scalar/TokenId"
import {
  GenerativeTokenVersion,
  GenMintProgressFilter,
} from "../types/GenerativeToken"
import {
  ObjktMetadata,
  TokenFeature,
  TokenFeatureValueType,
  TokenMetadata,
} from "../types/Metadata"
import { Action } from "./Action"
import { GenerativeToken } from "./GenerativeToken"
import { Listing } from "./Listing"
import { MediaImage } from "./MediaImage"
import { Offer } from "./Offer"
import { Redemption } from "./Redemption"
import { Split } from "./Split"
import { Transaction } from "./Transaction"
import { DateTransformer } from "./Transformers/DateTransformer"
import { User } from "./User"

@Entity()
@ObjectType({
  description:
    "Unique iterations of Generative Tokens. They are the NFT entities. Called *Objkt* in the API but is actually a **Gentk** (@ciphrd: my bad there, we're too deep now)",
})
export class Objkt extends BaseEntity {
  @PrimaryColumn()
  id: number

  // no need to expose the issuer version to the API
  @Column({
    primary: true,
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
    default: GenerativeTokenVersion.PRE_V3,
  })
  issuerVersion: GenerativeTokenVersion

  @Field({
    nullable: true,
    description:
      "URL-friendly unique string identifier to reference the Gentk. Computed on-the-fly by the indexer.",
  })
  @Column({ nullable: true })
  slug?: string

  @ManyToOne(() => GenerativeToken, token => token.objkts)
  @Filter(["in"], type => TokenId)
  issuer?: GenerativeToken

  @Column({ nullable: false })
  issuerId: number

  @ManyToOne(() => User, user => user.objkts)
  owner?: User | null

  @Column({ nullable: true })
  ownerId: string

  @ManyToOne(() => User, user => user.objktsMinted)
  minter?: User | null

  @Column()
  minterId: number

  @Field({
    nullable: true,
    description:
      "The gentk name, derived from the Generative Token and the iteration number: `{generative-token-name} #{iteration-number}`",
  })
  @Column({ nullable: true })
  name?: string

  @Field({
    nullable: true,
    description:
      "Whether or not this gentk was assigned by the fxhash signer module (if the metadata was set onchain)",
  })
  @Column({ nullable: true })
  @Filter(["eq"], type => Boolean)
  assigned?: boolean

  @Field({
    nullable: true,
    description: "The iteration number in the collection",
  })
  @Column({ nullable: true })
  iteration?: number

  @Field({
    nullable: true,
    description:
      "The transaction hash which represents the seed used by the Generative Token to generate the unique output",
  })
  @Column({ nullable: true })
  generationHash?: string

  @Field({
    nullable: true,
    deprecationReason: "The indexer doesn't treat duplicates anymore",
    description:
      "The first version of the contracts had no mechanic to prevent users from making batch calls to mint Generative Tokens. So it resulted in multiple tokens having the similar transaction hash, and thus the same output.",
  })
  @Column({ nullable: true })
  duplicate: boolean

  @Field(() => GraphQLJSONObject, {
    nullable: true,
    description:
      "The JSON metadata of the token, extracted from IPFS where it's stored. If the token is not yet signed, will be filled with the generic [WAITING TO BE SIGNED] metadata",
  })
  @Column({ type: "jsonb", nullable: true })
  metadata?: ObjktMetadata

  @Field({
    nullable: true,
    description: "The IPFS uri pointing to the JSON metadata of the token",
  })
  @Column({ nullable: true })
  metadataUri: string

  @Field(() => [String], {
    nullable: true,
    description:
      "A list of tags, set by the author(s) at mint time. Corresponds the the Generative Token tags.",
  })
  @Column("text", { nullable: true, array: true })
  tags: string[]

  @Field(() => [GraphQLJSONObject], {
    nullable: true,
    description:
      "A list of the features, extracted from the source code executed with the unique hash as input.",
  })
  @Column({ type: "jsonb", nullable: true })
  features?: TokenFeature[]

  @Field(() => Number, {
    nullable: true,
    description:
      "The rarity of the gentk, is expressed by the average of the rarity of each traits. Not very precise.",
  })
  @Column({ type: "double precision", nullable: true })
  rarity?: number

  @Field({
    description:
      "The royalties, which will be redistributed to the artists when a transaction on secondary market occurs. Expressed in per thousands (divide by 10 to get a percentage)",
  })
  @Column({ default: 0 })
  royalties: number = 0

  @OneToMany(() => Split, split => split.objkt)
  royaltiesSplit: Split[]

  @Field({
    description:
      "The contract version on which this gentk NFT is stored. (0 = beta contract, 1 = release contract, 2 = post-params contract)",
  })
  @Column({ default: 0 })
  version: number = 0

  @Field({
    description:
      "The IPFS URI pointing to the original capture made by the fxhash signer during the signing process. This maps to the `metadata`->`displayUri` of the token.",
    nullable: true,
  })
  @Column({ type: "char", length: 53, nullable: true })
  displayUri: string

  @Field({
    description:
      "The IPFS URI pointing to the 300x300 (contained) made by the fxhash signer from the original capture during the signing process. This maps to the `metadata`->`thumbnailUri` of the token.",
    nullable: true,
  })
  @Column({ type: "char", length: 53, nullable: true })
  thumbnailUri: string

  @ManyToOne(() => MediaImage, {
    nullable: true,
  })
  @JoinColumn({ name: "captureMediaId", referencedColumnName: "cid" })
  captureMedia: MediaImage

  @Column()
  captureMediaId: string

  @OneToMany(() => Listing, listing => listing.objkt)
  listings?: Listing[]

  @OneToMany(() => Offer, offer => offer.objkt)
  offers?: Offer[]

  @OneToMany(() => Transaction, transaction => transaction.objkt)
  transactions: Transaction[]

  @OneToMany(() => Action, action => action.objkt)
  actions: Action[]

  @OneToMany(() => Redemption, redemption => redemption.objkt)
  redemptions: Redemption[]

  @Field({
    description: "The time at which the gentk was minted on the blockchain.",
  })
  @CreateDateColumn({ type: "timestamptz", transformer: DateTransformer })
  @Filter(["lt", "gt"])
  createdAt: string

  @Field({
    nullable: true,
    description:
      "The time at which the metadata of the token was assigned on the blockchain.",
  })
  @Column({ type: "timestamptz", transformer: DateTransformer })
  @Filter(["gt", "lt"])
  assignedAt: string

  @Field(() => Number, {
    nullable: true,
    description: "Price (in tezos) from the first time it has been minted",
  })
  mintedPrice: number

  //
  // FILTERS FOR THE GQL ENDPOINT
  //

  @Filter(["eq"], type => GenMintProgressFilter)
  mintProgress: "completed" | "ongoing" | "almost"

  @Filter(["eq"], type => Boolean)
  authorVerified: Boolean

  @Filter(["in"], type => String)
  author: string[]

  @Filter(["eq"], type => String)
  searchQuery: string

  @Filter(["exist"], type => Boolean)
  activeListing: boolean
}

// the Type for the filters of the GraphQL query for Objkt
export const FiltersObjkt = generateFilterType(Objkt)
