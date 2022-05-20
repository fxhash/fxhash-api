import { IsIn } from "class-validator"
import { ArgsType, Field, InputType } from "type-graphql"


type TSortValue = "ASC" | "DESC"
type TSortInput = Record<string, TSortValue>

/**
 * Given an input sort (currentSort) and a default sort input, outputs the 
 * default sort input only if the input sort is empty, otherwise outputs the
 * input sort.
 */
export function defaultSort(
  currentSort: any,
  defaultSort: TSortInput,
): TSortInput {
  if (!currentSort || Object.keys(currentSort).length === 0) {
    return defaultSort
  }
  return currentSort
}


@InputType()
export class ListingsSortInput {
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  price?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  createdAt?: "ASC" | "DESC"

  // search-related sort filter
  @Field(type => String, { nullable: true })
  @IsIn(["DESC"])
  relevance?: "DESC"
}


@InputType()
export class OffersSortInput {
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  price?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  createdAt?: "ASC" | "DESC"
}


@InputType()
export class ObjktsSortInput {
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  id?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  listingPrice?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  listingCreatedAt?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  createdAt?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  rarity?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  iteration?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  collectedAt?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  assignedAt?: "ASC" | "DESC"

  // search-related sort filter
  @Field(type => String, { nullable: true })
  @IsIn(["DESC"])
  relevance?: "DESC"
}

@InputType()
export class GenerativeSortInput {  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  lockEnd?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  mintOpensAt?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  price?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  supply?: "ASC" | "DESC"
  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  balance?: "ASC" | "DESC"

  // search-related sort filter
  @Field(type => String, { nullable: true })
  @IsIn(["DESC"])
  relevance?: "DESC"
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

@InputType()
export class ActionsSortInput {
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  createdAt?: "ASC" | "DESC"

  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  type?: "ASC" | "DESC"
}

@InputType()
export class UserSortInput {  
  @Field(type => String, { nullable: true })
  @IsIn(["ASC", "DESC"])
  createdAt?: "ASC" | "DESC"
  
  // search-related sort filter
  @Field(type => String, { nullable: true })
  @IsIn(["DESC"])
  relevance?: "DESC"
}