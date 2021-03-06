import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Action } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { Listing } from "../Entity/Listing"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { processFilters } from "../Utils/Filters"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { Split } from "../Entity/Split"
import { FiltersOffer, Offer } from "../Entity/Offer"
import { objktQueryFilter } from "../Query/Filters/Objkt"
import { ObjktsSortInput, OffersSortInput } from "./Arguments/Sort"

@Resolver(Objkt)
export class ObjktResolver {
  @FieldResolver(returns => User, {
		description: "The current owner of this gentk. The fxhash marketplace contracts are ignored when there's a transfer of ownerhsip to their contracts."
	})
	owner(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext
	) {
		if (objkt.owner) return objkt.owner
		return ctx.usersLoader.load(objkt.ownerId)
	}

	@FieldResolver(returns => User, {
		description: "The user who originally minted this gentk."
	})
	minter(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext
	) {
		if (objkt.minter) return objkt.minter
		return ctx.usersLoader.load(objkt.minterId)
	}

	@FieldResolver(returns => GenerativeToken, {
		description: "The generative token from which this gentk was generated."
	})
	issuer(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext
	) {
		if (objkt.issuer) return objkt.issuer
		return ctx.genTokLoader.load(objkt.issuerId)
	}

	@FieldResolver(returns => [Split], {
		description: "A list of the royalties split for this gentk."
	})
	royaltiesSplit(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext,
	) {
		if (objkt.royaltiesSplit) return objkt.royaltiesSplit
		return ctx.objktRoyaltiesSplitsLoader.load(objkt.id)
	}

	@FieldResolver(returns => [Listing], { 
		nullable: true,
		description: "All the listings for the gentk. Includes all the listings related to the gentk, even those which were cancelled / accepted."
	})
	listings(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext
	) {
		return ctx.objktListingsLoader.load(objkt.id)
	}

	@FieldResolver(returns => Listing, {
		nullable: true,
		description: "The Listing currently active for the gentk, if any."
	})
	activeListing(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext,
	) {
		return ctx.objktActiveListingsLoader.load(objkt.id)
	}

	
	@FieldResolver(returns => [Offer], { 
		nullable: true,
		description: "All the offers for this gentk. Can be filtered."
	})
	offers(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersOffer, { nullable: true }) filters: any,
		@Arg("sort", { nullable: true }) sort: OffersSortInput
	) {
		// default sort
		if (!sort || Object.keys(sort).length === 0) {
			sort = {
				createdAt: "DESC"
			}
		}

		return ctx.objktOffersLoader.load({
			id: objkt.id,
			filters: filters,
			sort: sort,
		})
	}

	@FieldResolver(returns => [Action], {
		description: "The full history of the actions related to the gentk. **Note: this is not optimized for being run on multiple gentks at once, please run it only on endpoints who fetch a single gentk**."
	})
	actions(
		@Root() objkt: Objkt,
		@Ctx() ctx: RequestContext
	) {
		if (objkt.actions) return objkt.actions
		return ctx.objktActionsLoader.load(objkt.id)
	}
  
  @Query(returns => [Objkt], {
		description: "Generic paginated endpoint to query the gentks. Filtrable."
	})
	async objkts(
		@Args() { skip, take }: PaginationArgs,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
		@Arg("sort", { nullable: true }) sort: ObjktsSortInput
	): Promise<Objkt[]> {
		// default pagination
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		// default sort
		if (!sort || Object.keys(sort).length === 0) {
			sort = {
				id: "DESC"
			}
		}

		let query = Objkt.createQueryBuilder("objkt")
			.select()
			.leftJoin("objkt.issuer", "issuer")
		
		// FILTER
		query = await objktQueryFilter(
			query, {
				general: filters
			},
			sort
		)

		// pagination
		query.skip(skip)
		query.take(take)

		return query.getMany()
	}

	@Query(returns => Objkt, {
		nullable: true,
		description: "Endpoint to query a single gentk, using different trivial search criteria (id, hash or slug)."
	})
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
			// cache: 10000
		})
	}
}