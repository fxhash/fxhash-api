import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Action } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { processFilters } from "../Utils/Filters"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"

@Resolver(Objkt)
export class ObjktResolver {
  @FieldResolver(returns => User)
	owner(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext
	) {
		if (objkt.owner) return objkt.owner
		return ctx.objktOwnersLoader.load(objkt.id)
	}

	@FieldResolver(returns => GenerativeToken)
	issuer(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext
	) {
		if (objkt.issuer) return objkt.issuer
		return ctx.objktGenerativesLoader.load(objkt.id)
	}

	@FieldResolver(returns => Offer, { nullable: true })
	offer(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext
	) {
		if (objkt.offer) return objkt.offer
		return ctx.objktOffersLoader.load(objkt.id)
	}

	@FieldResolver(returns => [Action])
	actions(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext
	) {
		if (objkt.actions) return objkt.actions
		return ctx.objktActionsLoader.load(objkt.id)
	}
  
  @Query(returns => [Objkt])
	objkts(
		@Args() { skip, take }: PaginationArgs,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any
	): Promise<Objkt[]> {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return Objkt.find({
			where: processFilters(filters),
			order: {
				id: "DESC"
			},
			skip,
			take,
			cache: 10000
		})
	}

	@Query(returns => Objkt, { nullable: true })
	async objkt(
		@Arg('id', { nullable: true }) id: number,
		@Arg('hash', { nullable: true }) hash: string,
		@Arg('slug', { nullable: true }) slug: string,
	): Promise<Objkt|undefined> {
		if (id == null && hash == null && slug == null) return undefined
		let args: Record<string, any> = {}
		if (!(id == null)) args.id = id
		if (!(hash == null)) args.generationHash = hash
		if (!(slug == null)) args.slug = slug
		return Objkt.findOne({
			where: args,
			cache: 10000
		})
	}
}