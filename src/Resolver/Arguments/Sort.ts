import { IsIn } from "class-validator"
import { ArgsType, Field, InputType } from "type-graphql"


@ArgsType()
export class OffersSortArgs {
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  price?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  createdAt?: "ASC" | "DESC"
}


@ArgsType()
export class ObjktsSortArgs {
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  id?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  offerPrice?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  offerCreatedAt?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  createdAt?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  rarity?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  iteration?: "ASC" | "DESC"
}

@InputType()
export class GenerativeSortInput {
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  lockEnd?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  price?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  supply?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  balance?: "ASC" | "DESC"
}

@InputType()
export class StatsGenTokSortInput {
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  floor?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  secVolumeTz?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  secVolumeNb?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  secVolumeTz24?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  secVolumeNb24?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  secVolumeTz7d?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  secVolumeNb7d?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  secVolumeTz30d?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  secVolumeNb30d?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  primVolumeTz?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  primVolumeNb?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  lowestSold?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  highestSold?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  median?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  listed?: "ASC" | "DESC"
}