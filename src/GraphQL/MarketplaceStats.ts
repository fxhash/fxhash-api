import { Field, ObjectType } from "type-graphql"

@ObjectType()
export class GenerativeTokenMarketStats {
  @Field(type => Number, { nullable: true })
  floor: number|null

  @Field(type => Number, { nullable: true })
  median: number|null

  @Field(type => Number, { nullable: true })
  totalListing: number|null

  @Field(type => Number, { nullable: true })
  highestSold: number|null

  @Field(type => Number, { nullable: true })
  lowestSold: number|null

  @Field(type => Number, { nullable: true })
  primTotal: number|null

  @Field(type => Number, { nullable: true })
	secVolumeTz: number|null

  @Field(type => Number, { nullable: true })
	secVolumeNb: number|null

  @Field(type => Number, { nullable: true })
	secVolumeTz24: number|null

  @Field(type => Number, { nullable: true })
	secVolumeNb24: number|null
}