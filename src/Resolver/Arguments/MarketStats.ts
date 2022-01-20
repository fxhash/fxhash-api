import { Field, InputType } from "type-graphql"

@InputType()
export class MarketStatsHistoryInput {
  @Field(type => Date, { description: "The beginning (inclusive) of the segment to extract from the history" })
  from: Date
  
  @Field(type => Date, { description: "The end (exclusive) of the segment to extract from the history" })
  to: Date

  @Field(type => Number, { 
    nullable: true,
    description: "(NOT IMPLEMENTED YET) The number of hours to aggregate each segment in the results (default 1 hour)",
  })
  aggregation: number
}