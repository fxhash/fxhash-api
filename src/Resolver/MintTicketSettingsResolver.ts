import { Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { MintTicketSettings } from "../Entity/MintTicketSettings"
import { TokenId } from "../Scalar/TokenId"
import { RequestContext } from "../types/RequestContext"

@Resolver(MintTicketSettings)
export class MintTicketSettingsResolver {
  @FieldResolver(returns => GenerativeToken)
  async generativeToken(
    @Root() mintTicketSettings: MintTicketSettings,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.genTokLoader.load(
      new TokenId({
        id: mintTicketSettings.tokenId,
        version: mintTicketSettings.tokenVersion,
      })
    )
  }
}
