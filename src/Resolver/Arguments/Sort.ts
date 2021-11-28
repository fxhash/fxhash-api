import { IsIn } from "class-validator"
import { ArgsType, Field } from "type-graphql"


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
}