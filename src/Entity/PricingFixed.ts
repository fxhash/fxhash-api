import { Field, ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, JoinColumn, OneToOne } from "typeorm"
import { GenerativeToken } from "./GenerativeToken"

@Entity()
@ObjectType({
  description:
    "Describes the generic **Fixed Pricing** strategy which can be used by authors for their Generative Tokens.",
})
export class PricingFixed extends BaseEntity {
  @Column({ primary: true })
  tokenId: number

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
