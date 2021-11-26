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