import { Arg, Args, Ctx, Field, FieldResolver, ObjectType, Query, Resolver, Root } from "type-graphql"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { MarketStats } from "../Entity/MarketStats"
import { RequestContext } from "../types/RequestContext"

@Resolver(MarketStats)
export class MarketStatsResolver {
  @FieldResolver(returns => GenerativeToken, {
    nullable: true,
    description: "The Generative Token associated with the market stats."
  })
  generativeToken(
    @Root() stats: MarketStats,
		@Ctx() ctx: RequestContext,
  ) {
    if (stats.token) return stats.token
    return ctx.genTokLoader.load(stats.tokenId)
  }
}