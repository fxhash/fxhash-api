import { Arg, Args, Ctx, Field, FieldResolver, ObjectType, Query, Resolver, Root } from "type-graphql"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { MarketStats } from "../Entity/MarketStats"
import { RequestContext } from "../types/RequestContext"

@Resolver(MarketStats)
export class MarketStatsResolver {
  @FieldResolver(returns => GenerativeToken, { nullable: true })
  generativeToken(
    @Root() stats: MarketStats,
		@Ctx() ctx: RequestContext,
  ) {
    if (stats.token) return stats.token
    return ctx.marketStatsGenTokLoader.load(stats.tokenId)
  }
}