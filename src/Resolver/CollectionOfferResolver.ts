import { Ctx, FieldResolver, Resolver, Root } from "type-graphql"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { CollectionOffer } from "../Entity/CollectionOffer"
import { GenerativeToken } from "../Entity/GenerativeToken"

@Resolver(CollectionOffer)
export class CollectionOfferResolver {
  @FieldResolver(returns => User, {
    nullable: true,
    description: "The user who's proposing the offer.",
  })
  buyer(@Root() offer: CollectionOffer, @Ctx() ctx: RequestContext) {
    if (offer.buyer) return offer.buyer
    return ctx.usersLoader.load(offer.buyerId)
  }

  @FieldResolver(returns => GenerativeToken, {
    nullable: true,
    description: "The token associated with the collection offer.",
  })
  async token(@Root() offer: CollectionOffer, @Ctx() ctx: RequestContext) {
    if (offer.token) return offer.token
    return ctx.genTokLoader.load(offer.tokenId)
  }
}
