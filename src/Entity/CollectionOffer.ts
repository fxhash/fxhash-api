import { Field, ObjectType } from "type-graphql"
import { Filter } from "type-graphql-filter"
import {
  Entity,
  Column,
  PrimaryColumn,
  BaseEntity,
  ManyToOne,
  Index,
} from "typeorm"
import { GenerativeToken } from "./GenerativeToken"
import { User } from "./User"

@Entity()
@ObjectType({
  description:
    "Users can make offers on entire collections through the fxhash marketplace v2 contract.",
})
export class CollectionOffer extends BaseEntity {
  @Field({
    description:
      "The ID of the collection offer, corresponds to the ID in the marketplace contract",
  })
  @PrimaryColumn()
  id: number

  @Field({
    description:
      "The version of the contract, for now all the offers are on the same contract (1)",
  })
  @PrimaryColumn()
  version: number

  @Index()
  @ManyToOne(() => User, user => user.offers)
  buyer: User

  @Column()
  buyerId: string

  @Index()
  @ManyToOne(() => GenerativeToken, token => token.collectionOffers)
  token: GenerativeToken

  @Column()
  tokenId: number

  @Field({
    description: "The price proposed by the buyer",
  })
  @Column({ type: "bigint", default: "0" })
  price: string

  @Field({
    description:
      "The number of gentks the buyer wants to buy from the collection",
  })
  @Column()
  amount: number

  @Field({
    description:
      "The initial number of gentks the buyer wants to buy from the collection",
  })
  @Column()
  initialAmount: number

  @Field({
    description:
      "The block time when the collection offer was registerd on the blockchain",
  })
  @Column({ type: "timestamptz" })
  createdAt: Date

  @Field(() => Date, {
    nullable: true,
    description:
      "The block time when the collection offer was cancelled. If null, the offer was never cancelled. Completed collection offers cannot be cancelled.",
  })
  @Column({ type: "timestamptz", nullable: true })
  cancelledAt: Date | null

  @Field(() => Date, {
    nullable: true,
    description:
      "The block time when the collection offer was fulfilled. If null, the offer was never fulfilled. Completed collection offers cannot be cancelled.",
  })
  @Column({ type: "timestamptz", nullable: true })
  completedAt: Date | null

  //
  // CUSTOM FILTERS
  //

  // is the collection offer active ?
  @Filter(["eq"], () => Boolean)
  active: boolean
}
