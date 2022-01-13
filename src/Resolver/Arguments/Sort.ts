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