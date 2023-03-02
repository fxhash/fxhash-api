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
import { ReserveResolver } from "./ReserveResolver"
import { ModerationReasonResolver } from "./ModerationReasonResolver"
import { SearchResolver } from "./SearchResolver"
import { ArticleResolver } from "./ArticleResolver"
import { ArticleLedgerResolver } from "./ArticleLedgerResolver"
import { ArticleGenerativeTokenResolver } from "./ArticleGenerativeTokenResolver"
import { GentkAssignResolver } from "./GentkAssignResolver"
import { MintTicketResolver } from "./MintTicketResolver"
import { MintTicketSettingsResolver } from "./MintTicketSettingsResolver"
import { RedeemableResolver } from "./RedeemableResolver"
import { RedemptionResolver } from "./RedemptionResolver"

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
  ReserveResolver,
  StatusResolver,
  GentkAssignResolver,
  ModerationReasonResolver,
  SearchResolver,
  ArticleResolver,
  ArticleLedgerResolver,
  ArticleGenerativeTokenResolver,
  RedeemableResolver,
  RedemptionResolver,
  MintTicketResolver,
  MintTicketSettingsResolver,
]
