import { Field, ObjectType } from "type-graphql"
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { Action } from "./Action"
import { GenerativeToken } from "./GenerativeToken"
import { Redemption } from "./Redemption"
import { Split } from "./Split"

/**
 * A Redeemable token is a smart contract which can targets one project and
 * enables the project in having its iterations creating separate events, while
 * preserving the token ownership.
 */
@Entity()
@ObjectType({
  description:
    "A Redeemable is a Smart Contract which accepts tokens from a particular project. Those tokens can be redeemed to trigger (on/off)-chain events using onchain verification of the assets ownership.",
})
export class Redeemable extends BaseEntity {
  @Field(type => String, {
    description: "The address of the Redeemable Smart Contract.",
  })
  @PrimaryColumn({ type: "varchar", length: 36 })
  address: string

  @ManyToOne(() => GenerativeToken, token => token.redeemables)
  token: GenerativeToken

  @Column()
  tokenId: number

  @Column({
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
  })
  tokenVersion: GenerativeTokenVersion

  @Field({
    description: "The base price to redeem an asset, **in mutez**.",
  })
  @Column({ type: "bigint" })
  baseAmount: number

  @Field({
    description: "The maximum number of times an asset can be redeemed.",
  })
  @Column()
  maxConsumptionsPerToken: number

  @OneToMany(() => Split, split => split.redeemable)
  splits: Split[]

  @OneToMany(() => Redemption, redemption => redemption.redeemable)
  redemptions: Redemption[]

  @OneToMany(() => Action, action => action.redeemable)
  actions: Redemption[]

  @Field({
    description: "When the Smart Contract was originated.",
  })
  @Column({ type: "timestamptz" })
  createdAt: Date
}
