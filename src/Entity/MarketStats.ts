import { Field, ObjectType } from "type-graphql"
import {
  Entity,
  Column,
  PrimaryColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
} from "typeorm"
import { GenerativeToken } from "./GenerativeToken"

@Entity()
@ObjectType({
  description:
    "The market stats for **Generative Tokens**. Computed periodically by a side-worker.",
})
export class MarketStats extends BaseEntity {
  @PrimaryColumn()
  tokenId: number

  @OneToOne(() => GenerativeToken)
  @JoinColumn()
  token: GenerativeToken

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  floor: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  median: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "int", nullable: true })
  listed: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  highestSold: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  lowestSold: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  primVolumeNb: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  primVolumeTz: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  secVolumeTz: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  secVolumeNb: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  secVolumeTz24: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  secVolumeNb24: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  secVolumeTz7d: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  secVolumeNb7d: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  secVolumeTz30d: number | null

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  secVolumeNb30d: number | null

  @Field()
  @Column({ type: "timestamptz" })
  from: Date

  @Field()
  @Column({ type: "timestamptz" })
  to: Date
}
