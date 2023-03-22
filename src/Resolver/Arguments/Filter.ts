import {
  createUnionType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql"

export enum FeatureType {
  BOOLEAN = "BOOLEAN",
  STRING = "STRING",
  NUMBER = "NUMBER",
}

registerEnumType(FeatureType, {
  name: "FeatureType",
  description: "The type of the feature, either boolean, string or number",
})

@InputType()
export class FeatureFilter {
  @Field()
  name: string

  @Field(type => [String], {
    description:
      "The serialized value, because GraphQL only supports a single type for inputs",
  })
  values: string[]

  @Field(type => FeatureType, {
    description:
      "GraphQL doesn't support multiple types as input, so this fields indicates how to process the value",
  })
  type: FeatureType
}

/**
 * Input which can be run for a site-wide search
 */
@InputType()
export class SearchFilters {
  @Field({
    description: "The string which will be run for the search.",
  })
  searchQuery_eq: string
}
