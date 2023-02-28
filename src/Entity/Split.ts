import { Field, ObjectType } from "type-graphql"
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { Article } from "./Article"
import { GenerativeToken } from "./GenerativeToken"
import { Objkt } from "./Objkt"
import { Redeemable } from "./Redeemable"
import { User } from "./User"

/**
 * A Split defines a % of the shares owned by a user
 */
@Entity()
@ObjectType({
  description:
    "Describes a generic split (ie: how much shares belong to a given user in any context).",
})
export class Split extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Field({
    description:
      "The per-thousands value associated with the split. Divide by 10 to get percentage.",
  })
  @Column()
  pct: number

  @ManyToOne(() => User, user => user.splits)
  user: User

  @Column()
  userId: string

  @Index()
  @ManyToOne(() => GenerativeToken, token => token.splitsPrimary, {
    onDelete: "CASCADE",
  })
  generativeTokenPrimary: GenerativeToken

  @Column()
  generativeTokenPrimaryId: number

  @Column({
    primary: true,
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
  })
  generativeTokenPrimaryVersion: GenerativeTokenVersion

  @Index()
  @ManyToOne(() => GenerativeToken, token => token.splitsSecondary)
  generativeTokenSecondary: GenerativeToken

  @Column()
  generativeTokenSecondaryId: number

  @Column({
    primary: true,
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
  })
  generativeTokenSecondaryVersion: GenerativeTokenVersion

  @Index()
  @ManyToOne(() => Objkt, token => token.royaltiesSplit)
  objkt: Objkt

  @Column()
  objktId: number

  @Index()
  @ManyToOne(() => Article, article => article.royaltiesSplit, {
    onDelete: "CASCADE",
  })
  article: Article

  @Column()
  articleId: number

  @ManyToOne(() => Redeemable, redeemable => redeemable.splits, {
    onDelete: "CASCADE",
  })
  redeemable: Redeemable

  @Column()
  redeemableAddress: string
}
