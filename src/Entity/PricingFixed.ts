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
    "Describes the generic **Fixed Pricing** strategy which can be used by authors for their Generative Tokens.",
})
export class PricingFixed extends BaseEntity {
  @Column({ primary: true })
  tokenId: number

  @Column({
    primary: true,
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
  })
  tokenVersion: GenerativeTokenVersion

  @OneToOne(() => GenerativeToken, token => token.pricingFixed, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  token: GenerativeToken

  @Field({
    description: "Price, in **mutez**",
  })
  @Column({ type: "bigint" })
  price: number

  @Field({
    nullable: true,
    description:
      "If any, defines when will the minting of a token be automatically enabled.",
  })
  @Column({ type: "timestamptz", nullable: true })
  opensAt: Date
}
