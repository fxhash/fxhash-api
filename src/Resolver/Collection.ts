import { NonEmptyArray } from "type-graphql"
import { ActionResolver } from "./ActionResolver"
import { GenTokenResolver } from "./GenTokenResolver"
import { MarketStatsResolver } from "./MarketStats"
import { MarketStatsDataResolver } from "./MarketStatsDataResolver"
import { ObjktResolver } from "./ObjktResolver"
import { ListingResolver } from "./ListingResolver"
import { SplitResolver } from "./SplitResolver"
import { UserResolver } from "./UserResolver"
import { StatusResolver } from "./StatusResolver"

export const ResolverCollection: NonEmptyArray<Function> = [
  UserResolver,
  GenTokenResolver,
  ObjktResolver,
  ActionResolver,
  ListingResolver,
  MarketStatsDataResolver,
  MarketStatsResolver,
  SplitResolver,
  StatusResolver,
]