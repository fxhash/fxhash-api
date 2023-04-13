import { Arg, Ctx, FieldResolver, Int, Resolver, Root } from "type-graphql"
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

  @FieldResolver(returns => Int, {
    nullable: true,
    description:
      "The minimum price paid by the supplied address for a gentk in this collection - secondary sales only.",
  })
  async minLastSoldPrice(
    @Root() offer: CollectionOffer,
    @Arg("userId", _type => String, { nullable: true }) userId: string,
    @Ctx() ctx: RequestContext
  ) {
    if (!userId) return null

    return ctx.usersGentkMinLastSoldPriceLoader.load({
      ownerId: userId,
      tokenId: offer.tokenId,
    })
  }
}
