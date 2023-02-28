import { Field, ObjectType } from "type-graphql"
import {
  BaseEntity,
  Column,
  Entity,
  EntityManager,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { GenerativeToken } from "./GenerativeToken"

@Entity()
@ObjectType({
  description:
    "Describes a the **Dutch Auction** pricing method which can be used by artists for their Generative Tokens.",
})
export class PricingDutchAuction extends BaseEntity {
  @Column({ primary: true })
  tokenId: number

  @Column({
    primary: true,
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
  })
  tokenVersion: GenerativeTokenVersion

  @OneToOne(() => GenerativeToken, token => token.pricingDutchAuction, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  token: GenerativeToken

  @Field(type => [Number], {
    description:
      "A list of the different pricing levels (in **mutez**), in the right order",
  })
  @Column({
    type: "bigint",
    array: true,
  })
  levels: number[]

  @Field({
    description: "Corresponds to the last level of the Dutch Auction",
  })
  @Column({ type: "bigint" })
  restingPrice: number

  @Field({
    description: "The time between each level, in **seconds**",
  })
  @Column({ type: "bigint" })
  decrementDuration: number

  @Field({
    description:
      "When the dutch auction will open. This is when the first level of the list will be the active price of a token.",
  })
  @Column({ type: "timestamptz", nullable: true })
  opensAt: Date

  @Field({
    nullable: true,
    description:
      "The price of the last gentk minted during the Dutch Auction. *If null, collection is not fully minted yet*",
  })
  @Column({ type: "bigint", nullable: true })
  finalPrice: number
}
