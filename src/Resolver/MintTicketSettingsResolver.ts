import { Ctx, FieldResolver, Resolver, Root } from "type-graphql"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { MintTicketSettings } from "../Entity/MintTicketSettings"
import { RequestContext } from "../types/RequestContext"

@Resolver(MintTicketSettings)
export class MintTicketSettingsResolver {
  @FieldResolver(returns => GenerativeToken)
  async generativeToken(
    @Root() mintTicketSettings: MintTicketSettings,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.genTokLoader.load(mintTicketSettings.tokenId)
  }
}
