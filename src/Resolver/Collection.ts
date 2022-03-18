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
import { OfferResolver } from "./OfferResolver"

export const ResolverCollection: NonEmptyArray<Function> = [
  UserResolver,
  GenTokenResolver,
  ObjktResolver,
  ActionResolver,
  ListingResolver,
  OfferResolver,
  MarketStatsDataResolver,
  MarketStatsResolver,
  SplitResolver,
  StatusResolver,
]