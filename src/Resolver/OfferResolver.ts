import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Offer } from "../Entity/Offer"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { PaginationArgs } from "./Arguments/Pagination"
import { GenTokenResolver } from "./GenTokeenResolver"

@Resolver(Offer)
export class OfferResolver {
  @FieldResolver(returns => User, { nullable: true })
	issuer(
		@Root() offer: Offer,
		@Ctx() ctx: RequestContext
	) {
    if (offer.issuerId == null) return null
		if (offer.issuer) return offer.issuer
		return ctx.usersLoader.load(offer.issuerId)
	}

  @FieldResolver(returns => Objkt, { nullable: true })
	objkt(
		@Root() offer: Offer,
		@Ctx() ctx: RequestContext
	) {
    if (offer.objktId == null) return null
		if (offer.objkt) return offer.objkt
		return ctx.objktsLoader.load(offer.objktId)
	}
  
  @Query(returns => [Offer])
	async offers(
		@Args() { skip, take }: PaginationArgs
	): Promise<Offer[]> {
		return Offer.find({
			order: {
				createdAt: "ASC"
			},
			skip,
			take,
		})
	}

	@Query(returns => [Offer])
	async searchOffers(
		@Arg('search') search: string
	): Promise<Offer[]> {
		const formattedQuery = search.trim().replace(/ /g, ' & ');
		const offers = await Offer.createQueryBuilder('offer')
			.leftJoinAndSelect('offer.issuer', 'issuer')
			.leftJoinAndSelect('offer.objkt', 'objkt')
			.where(`to_tsvector(token.name) @@ to_tsquery(:search)`, { search: `${formattedQuery}` })
			.orWhere(`to_tsvector(issuer.name) @@ to_tsquery(:search)`, { search: `${formattedQuery}` })
			.orWhere(`to_tsvector(objkt.name) @@ to_tsquery(:search)`, { search: `${formattedQuery}` })
			.getMany()
		return offers
	}
}