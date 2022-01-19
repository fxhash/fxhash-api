import { registerEnumType } from "type-graphql"

export enum GenMintProgressFilter {
  COMPLETED   = "COMPLETED",
  ONGOING     = "ONGOING",
  ALMOST      = "ALMOST",
}

registerEnumType(GenMintProgressFilter, {
  name: "GenMintProgressFilter", // this one is mandatory
  description: "Filter for the progress of the mint", // this one is optional
})