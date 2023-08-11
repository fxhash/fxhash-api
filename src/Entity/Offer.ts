import { Field, ObjectType, registerEnumType } from "type-graphql"
import { Filter, generateFilterType } from "type-graphql-filter"
import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne } from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { Objkt } from "./Objkt"
import { User } from "./User"

export enum OfferStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  ACCEPTED = "ACCEPTED",
}

registerEnumType(OfferStatus, {
  name: "OfferStatus",
  description: "The status of the offer",
})

@Entity()
@ObjectType({
  description:
    "Users can make offers on particular gentks through the fxhash marketplace v2 contract.",
})
export class Offer extends BaseEntity {
  @Field({
    description:
      "The ID of the offer, corresponds to the ID in the marketplace contract",
  })
  @PrimaryColumn()
  id: number

  @Field({
    description:
      "The version of the contract, for now all the offers are on the same contract (1)",
  })
  @PrimaryColumn()
  version: number

  @ManyToOne(() => User, user => user.offers)
  buyer: User

  @Column()
  buyerId: string

  @ManyToOne(() => Objkt, objkt => objkt.offers)
  objkt: Objkt

  @Column()
  objktId: number

  @Column({
    type: "enum",
    enumName: "generative_token_version",
    enum: GenerativeTokenVersion,
  })
  objktIssuerVersion: GenerativeTokenVersion

  @Field({
    description: "The price proposed by the buyer",
  })
  @Column({ type: "bigint", default: "0" })
  price: number

  @Field({
    description:
      "The block time when the offer was registerd on the blockchain",
  })
  @Column({ type: "timestamptz" })
  createdAt: Date

  @Field(() => Date, {
    nullable: true,
    description:
      "The block time when the offer was cancelled. If null, the offer was never cancelled. Accepted offer cannot be cancelled.",
  })
  @Column({ type: "timestamptz", nullable: true })
  cancelledAt: Date | null

  @Field(() => Date, {
    nullable: true,
    description:
      "The block time when the offer was accepted by the owner of the gentk. If null, the offer was never accepted. Accepted offer cannot be cancelled.",
  })
  @Column({ type: "timestamptz", nullable: true })
  acceptedAt: Date | null

  //
  // CUSTOM FILTERS
  //

  // is the offer active ?
  @Filter(["eq"], () => Boolean)
  active: boolean

  @Filter(["eq"], () => OfferStatus)
  status: OfferStatus
}

// the Type for the filters of the GraphQL query for Offer
export const FiltersOffer = generateFilterType(Offer)
