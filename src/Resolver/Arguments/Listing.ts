import { Field, InputType } from "type-graphql"

@InputType()
export class ListingID {
  @Field({
    description: "The ID of the listing, matches the ID on-chain",
  })
  id: number

  @Field({
    description: "The marketplace contract version on which the Listing was created (old contract = 0, new contract = 1)",
  })
  version: number
}