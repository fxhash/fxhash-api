import { GraphQLJSONObject } from "graphql-type-json"
import { Field, Int, ObjectType, registerEnumType } from "type-graphql"
import { Filter, generateFilterType } from "type-graphql-filter"
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm"
import { ArticleMetadata } from "../types/Metadata"
import { Action } from "./Action"
import { ArticleGenerativeToken } from "./ArticleGenerativeToken"
import { ArticleLedger } from "./ArticleLedger"
import { ArticleRevision } from "./ArticleRevision"
import { Listing } from "./Listing"
import { MediaImage } from "./MediaImage"
import { ModerationReason } from "./ModerationReason"
import { Split } from "./Split"
import { Transaction } from "./Transaction"
import { DateTransformer } from "./Transformers/DateTransformer"
import { User } from "./User"

export enum ArticleFlag {
  NONE = "NONE",
  CLEAN = "CLEAN",
  REPORTED = "REPORTED",
  AUTO_DETECT_COPY = "AUTO_DETECT_COPY",
  MALICIOUS = "MALICIOUS",
  HIDDEN = "HIDDEN",
}
registerEnumType(ArticleFlag, {
  name: "ArticleFlag",
  description: "Flag state of Generative Token",
})

@Entity()
@ObjectType({
  description:
    "Articles are FA2 assets. Articles were designed not only to support fxhash but also the whole tezos ecosystem.",
})
export class Article extends BaseEntity {
  @Field({
    description:
      "Unique ID of the article, corresponding to the FA2 bigmap key identifier.",
  })
  @Index()
  @PrimaryColumn({ type: "integer" })
  @Filter(["in"], type => Int)
  id: number

  @Field({
    description: "Unique slug-id for the article, derived from the title.",
  })
  @Column()
  slug: string

  @Field(() => ArticleFlag, {
    description:
      "Articles can be moderated and their moderation state will reflect in this property.",
  })
  @Column({
    type: "enum",
    enum: ArticleFlag,
    default: ArticleFlag.NONE,
  })
  @Filter(["eq", "in", "ne"], () => ArticleFlag)
  flag: ArticleFlag

  @Filter(["eq"], () => String)
  @ManyToOne(() => User, user => user.articles)
  author: User

  @Index()
  @Column()
  authorId: string

  @OneToMany(() => ArticleLedger, ledger => ledger.article)
  ledgers: ArticleLedger[]

  @OneToMany(() => Listing, listing => listing.article)
  listings?: Listing[]

  @OneToMany(() => ArticleGenerativeToken, jointure => jointure.article)
  generativeTokenJointures: ArticleGenerativeToken[]

  @OneToMany(() => ArticleRevision, revision => revision.article)
  revisions: ArticleRevision[]

  @OneToMany(() => Split, split => split.article)
  royaltiesSplit: Split[]

  @OneToMany(() => Action, action => action.article)
  actions: Action[]

  @OneToMany(() => Transaction, transaction => transaction.article)
  transactions: Transaction[]

  @ManyToOne(() => ModerationReason, reason => reason.articles, {
    nullable: true,
  })
  moderationReason?: ModerationReason

  @Column()
  moderationReasonId: string

  @Field({
    description:
      "Title of the article. Maps to the `name` field of the JSON metadata.",
  })
  @Column()
  title: string

  @Field({
    description:
      "Abstract of the article. By default corresponds to the first paragraph but it's not enforced by the spec.",
  })
  @Column()
  description: string

  @Field({
    description:
      "Markdown text which corresponds to the content of the article. Github Flavored Markdown with extended specification to cover the embedding of blockchain content.",
  })
  @Column()
  body: string

  @Field(() => [String], {
    description:
      "An array of tags, describing the content for search purposes.",
  })
  @Column({ type: "text", array: true })
  tags: string[]

  @Field({
    description:
      "The language in which the article was written, RFC 1776 specification.",
  })
  @Column()
  language: string

  @Field({
    description:
      "IPFS uri pointing to the current on-chain metadata of the article.",
  })
  @Column()
  metadataUri: string

  @Field(() => GraphQLJSONObject, {
    description:
      "JSON content of the current on-chain metadata of the article. All the fields of the metadata are exposed individually by the Article object to remove the need to fetch this field which may increase payloads.",
  })
  @Column({ type: "json" })
  metadata: ArticleMetadata

  @Filter(["eq"])
  @Field({
    description:
      "Is the onchain metadata locked ? Locked metadata become immutable.",
  })
  @Column()
  metadataLocked: boolean

  @Field({
    description:
      "IPFS uri pointing to the markdown text content of the article.",
  })
  @Column()
  artifactUri: string

  @Field({
    description: "IPFS uri pointing to the HQ image preview of the article.",
  })
  @Column()
  displayUri: string

  @Field({
    description: "IPFS uri pointing to the LQ image preview of the article.",
  })
  @Column()
  thumbnailUri: string

  @ManyToOne(() => MediaImage, {
    nullable: true,
  })
  @JoinColumn({ name: "thumbnailMediaId", referencedColumnName: "cid" })
  thumbnailMedia: MediaImage

  @Column()
  thumbnailMediaId: string

  @Field({
    description: "An optional caption for the thumbnail.",
    nullable: true,
  })
  @Column({
    nullable: true,
  })
  thumbnailCaption?: string

  @Field(() => [String], {
    description:
      "A list of the platforms targetted by the article. To facilitate indexing by the platforms for articles scoped to their content, this field can be used.",
    nullable: true,
  })
  @Column({ type: "text", array: true, nullable: true })
  platforms?: string[] | null

  @Field({
    description: "Date of mint of the article.",
  })
  @Column({ type: "timestamptz", transformer: DateTransformer })
  createdAt: string

  @Filter(["lte", "gte"])
  @Field({
    description: "Number of editions of the semi-fungible FA2 asset.",
  })
  @Column({ type: "bigint" })
  editions: number

  @Filter(["lte", "gte"])
  @Field({
    description:
      "Royalties as set by the minter and defined onchain, in per thousands.",
  })
  @Column()
  royalties: number

  @Field({
    description: "The hash of the transaction for minting the FA2 asset.",
  })
  @Column()
  mintOpHash: string

  //
  // CUSTOM FILTERS
  //

  @Filter(["eq"], type => String)
  searchQuery: string
}

export const ArticleFilters = generateFilterType(Article)
