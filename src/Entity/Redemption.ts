import { Field, ObjectType } from "type-graphql"
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { GenerativeToken } from "./GenerativeToken"
import { Objkt } from "./Objkt"
import { Redeemable } from "./Redeemable"
import { User } from "./User"

/**
 * A Gentk can be redeemed, in which case its activation will be triggered.
 * Redemptions are saved as single events, indicating that one has redeemed
 * their token, after which it cannot be redeemed anymore.
 */
@ObjectType({
  description:
    "A redemption is an event recorder when an asset is redeemed on a Redeemable Smart Contract.",
})
@Entity()
export class Redemption extends BaseEntity {
  @Field({
    description: "Auto-increment ID, unrelated to the blockchain.",
  })
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Redeemable, redeemable => redeemable.redemptions)
  redeemable: Redeemable

  @Column()
  redeemableAddress: string

  @ManyToOne(() => Objkt, objkt => objkt.redemptions)
  objkt: Objkt

  @Column()
  objktId: number

  @Column({
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
  })
  objktIssuerVersion: GenerativeTokenVersion

  @ManyToOne(() => User, user => user.redemptions)
  redeemer: User

  @Column()
  redeemerId: string

  @Field({
    description: "When the redemption event took place",
  })
  @Column({ type: "timestamptz" })
  createdAt: Date
}
