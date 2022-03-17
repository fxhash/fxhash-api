import { NonEmptyArray } from "type-graphql"
import { ActionResolver } from "./ActionResolver"
import { GenTokenResolver } from "./GenTokeenResolver"
import { MarketStatsResolver } from "./MarketStats"
import { MarketStatsDataResolver } from "./MarketStatsDataResolver"
import { ObjktResolver } from "./ObjktResolver"
import { OfferResolver } from "./OfferResolver"
import { SplitResolver } from "./SplitResolver"
import { UserResolver } from "./UserResolver"

export const ResolverCollection: NonEmptyArray<Function> = [
  UserResolver,
  GenTokenResolver,
  ObjktResolver,
  ActionResolver,
  OfferResolver,
  MarketStatsDataResolver,
  MarketStatsResolver,
  SplitResolver,
]