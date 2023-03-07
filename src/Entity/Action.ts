import { GraphQLJSONObject } from "graphql-type-json"
import { Field, ObjectType, registerEnumType } from "type-graphql"
import { Filter, generateFilterType } from "type-graphql-filter"
import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { HistoryMetadata } from "../types/Metadata"
import { Article } from "./Article"
import { GenerativeToken } from "./GenerativeToken"
import { Objkt } from "./Objkt"
import { Redeemable } from "./Redeemable"
import { DateTransformer } from "./Transformers/DateTransformer"
import { User } from "./User"

export enum TokenActionType {
  NONE = "NONE",
  UPDATE_STATE = "UPDATE_STATE",
  UPDATE_PRICING = "UPDATE_PRICING",
  BURN_SUPPLY = "BURN_SUPPLY",
  MINTED = "MINTED",
  MINTED_FROM = "MINTED_FROM",
  GENTK_SIGNED = "GENTK_SIGNED",
  GENTK_REDEEMED = "GENTK_REDEEMED",
  COMPLETED = "COMPLETED",
  TRANSFERED = "TRANSFERED",
  LISTING_V1 = "LISTING_V1",
  LISTING_V1_CANCELLED = "LISTING_V1_CANCELLED",
  LISTING_V1_ACCEPTED = "LISTING_V1_ACCEPTED",
  LISTING_V2 = "LISTING_V2",
  LISTING_V2_CANCELLED = "LISTING_V2_CANCELLED",
  LISTING_V2_ACCEPTED = "LISTING_V2_ACCEPTED",
  LISTING_V3 = "LISTING_V3",
  LISTING_V3_CANCELLED = "LISTING_V3_CANCELLED",
  LISTING_V3_ACCEPTED = "LISTING_V3_ACCEPTED",
  OFFER = "OFFER",
  OFFER_CANCELLED = "OFFER_CANCELLED",
  OFFER_ACCEPTED = "OFFER_ACCEPTED",
  COLLECTION_OFFER = "COLLECTION_OFFER",
  COLLECTION_OFFER_CANCELLED = "COLLECTION_OFFER_CANCELLED",
  COLLECTION_OFFER_ACCEPTED = "COLLECTION_OFFER_ACCEPTED",
  AUCTION = "AUCTION",
  AUCTION_BID = "AUCTION_BID",
  AUCTION_CANCELLED = "AUCTION_CANCELLED",
  AUCTION_FULFILLED = "AUCTION_FULFILLED",
  ARTICLE_MINTED = "ARTICLE_MINTED",
  ARTICLE_METADATA_UPDATED = "ARTICLE_METADATA_UPDATED",
  ARTICLE_METADATA_LOCKED = "ARTICLE_METADATA_LOCKED",
  ARTICLE_EDITIONS_TRANSFERED = "ARTICLE_EDITIONS_TRANSFERED",
  CODEX_UPDATED = "CODEX_UPDATED",
}
registerEnumType(TokenActionType, {
  name: "ActionType",
  description: "The type of the action",
})

@Entity()
@ObjectType({
  description:
    "A polymorphic entity which describes actions made by users on the platform.",
})
export class Action extends BaseEntity {
  @Field({
    description:
      "A random ID associated with the action during the indexing process.",
  })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Field(() => TokenActionType, {
    description:
      "The type of the action. Different action types will have different fields populated.",
  })
  @Column({
    type: "enum",
    enum: TokenActionType,
    default: TokenActionType.NONE,
  })
  @Filter(["in", "eq"], () => TokenActionType)
  type: TokenActionType

  @ManyToOne(() => User, user => user.actionsAsIssuer)
  issuer?: User

  @Column()
  issuerId: number

  @ManyToOne(() => User, user => user.actionsAsTarget)
  target?: User

  @Column()
  targetId: number

  @ManyToOne(() => GenerativeToken, token => token.actions)
  token?: GenerativeToken

  @Column()
  tokenId: number

  @Column({
    type: "enum",
    enumName: "generative_token_version",
    enum: GenerativeTokenVersion,
  })
  tokenVersion: GenerativeTokenVersion

  @ManyToOne(() => Objkt, token => token.actions)
  objkt?: Objkt

  @Column()
  objktId: number

  @Column({
    type: "enum",
    enumName: "generative_token_version",
    enum: GenerativeTokenVersion,
  })
  objktIssuerVersion: GenerativeTokenVersion

  @ManyToOne(() => Redeemable, red => red.actions, {
    onDelete: "CASCADE",
  })
  redeemable?: Redeemable

  @Column({ nullable: true, default: null })
  redeemableAddress: number

  @ManyToOne(() => Article, article => article.actions, { onDelete: "CASCADE" })
  article: Article

  @Column({ nullable: true })
  articleId: number

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: "jsonb", nullable: true })
  metadata: HistoryMetadata

  @Field({
    nullable: true,
    description:
      "A numeric value associated with the action. Sometimes this numeric value can also be found in the metadata, but it's easier to store it to perform operations directly on the field in the DB. Not all the actions have a direct numericValue associated with them.",
  })
  @Column({ type: "bigint", nullable: true })
  numericValue: number

  @Field({
    description:
      "The time at which the action was registered on the blockchain, ie the time of the block when the operation was registered.",
  })
  @Column({ type: "timestamptz", transformer: DateTransformer })
  createdAt: string

  @Field({
    description: "The operation hash corresponding to the action.",
  })
  @Column()
  opHash: string
}

// the filters for the Action entity
export const FiltersAction = generateFilterType(Action)
