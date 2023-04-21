import { registerEnumType } from "type-graphql"

export enum GenMintProgressFilter {
  COMPLETED = "COMPLETED",
  ONGOING = "ONGOING",
  ALMOST = "ALMOST",
}

registerEnumType(GenMintProgressFilter, {
  name: "GenMintProgressFilter", // this one is mandatory
  description: "Filter for the progress of the mint", // this one is optional
})

export enum GenerativeTokenVersion {
  PRE_V3 = "PRE_V3",
  V3 = "V3",
}

registerEnumType(GenerativeTokenVersion, {
  name: "GenerativeTokenVersion",
  description: "The version of the generative token",
})
