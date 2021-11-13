import { NonEmptyArray } from "type-graphql"
import { ActionResolver } from "./ActionResolver"
import { GenTokenResolver } from "./GenTokeenResolver"
import { ObjktResolver } from "./ObjktResolver"
import { OfferResolver } from "./OfferResolver"
import { UserResolver } from "./UserResolver"

export const ResolverCollection: NonEmptyArray<Function> = [
  UserResolver,
  GenTokenResolver,
  ObjktResolver,
  ActionResolver,
  OfferResolver,
]