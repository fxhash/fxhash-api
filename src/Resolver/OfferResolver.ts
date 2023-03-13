import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  Root,
} from "type-graphql"
import { Objkt } from "../Entity/Objkt"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { Offer } from "../Entity/Offer"
import { ObjktId } from "../Scalar/ObjktId"

@Resolver(Offer)
export class OfferResolver {
  @FieldResolver(returns => User, {
    nullable: true,
    description: "The user who's proposing the offer.",
  })
  buyer(@Root() offer: Offer, @Ctx() ctx: RequestContext) {
    if (offer.buyer) return offer.buyer
    return ctx.usersLoader.load(offer.buyerId)
  }

  @FieldResolver(returns => Objkt, {
    nullable: true,
    description: "The objkt associated with the offer.",
  })
  async objkt(@Root() offer: Offer, @Ctx() ctx: RequestContext) {
    if (offer.objkt) return offer.objkt
    return ctx.objktsLoader.load(
      new ObjktId({
        id: offer.objktId,
        issuerVersion: offer.objktIssuerVersion,
      })
    )
  }
}
