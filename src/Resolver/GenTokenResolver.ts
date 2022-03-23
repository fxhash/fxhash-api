import { ApolloError } from "apollo-server-errors"
import { GraphQLJSONObject } from "graphql-type-json"
import { Arg, Args, Ctx, Field, FieldResolver, ObjectType, Query, Resolver, Root } from "type-graphql"
import { Brackets, Equal, getManager, In, IsNull, LessThanOrEqual, MoreThan, Not } from "typeorm"
import { Action, FiltersAction } from "../Entity/Action"
import { GenerativeFilters, GenerativeToken, GentkTokPricing, GenTokFlag } from "../Entity/GenerativeToken"
import { MarketStats } from "../Entity/MarketStats"
import { MarketStatsHistory } from "../Entity/MarketStatsHistory"
import { ModerationReason } from "../Entity/ModerationReason"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { FiltersOffer, Offer } from "../Entity/Offer"
import { PricingDutchAuction } from "../Entity/PricingDutchAuction"
import { PricingFixed } from "../Entity/PricingFixed"
import { Report } from "../Entity/Report"
import { Reserve } from "../Entity/Reserve"
import { Split } from "../Entity/Split"
import { User } from "../Entity/User"
import { searchIndexGenerative } from "../Services/Search"
import { RequestContext } from "../types/RequestContext"
import { processFilters, processGenerativeFilters } from "../Utils/Filters"
import { getGenerativeTokenPrice } from "../Utils/GenerativeToken"
import { FeatureFilter } from "./Arguments/Filter"
import { MarketStatsHistoryInput } from "./Arguments/MarketStats"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { ActionsSortInput, defaultSort, GenerativeSortInput, ObjktsSortInput } from "./Arguments/Sort"

@Resolver(GenerativeToken)
export class GenTokenResolver {
  @FieldResolver(returns => [Objkt], {
		description: "Get the unique iterations generated from the Generative Token. This is the go-to endpoint to get the gentks as it's the most optimized and is built to support sort and filter options."
	})
	async objkts(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
		@Arg("featureFilters", type => [FeatureFilter], { nullable: true }) featureFilters: FeatureFilter[],
		@Arg("sort", { nullable: true }) sort: ObjktsSortInput,
		@Args() { skip, take }: PaginationArgs,
	) {
		// defaults
		if (!sort || Object.keys(sort).length === 0) {
			sort = {
				iteration: "ASC"
			}
		}
		[skip, take] = useDefaultValues([skip, take], [0, 20])

		// we parse the feature filters
		if (token.objkts) return token.objkts
		return ctx.genTokObjktsLoader.load({ 
			id: token.id,
			filters,
			featureFilters,
			sort,
			skip,
			take,
		})
	}

  @FieldResolver(returns => [Objkt], {
		description: "The whole gentks belonging to the Generative Token. **This endpoint must be used with moderation as the fetch can be expensive if ran on many Generative Tokens**."
	})
	async entireCollection(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.objkts) return token.objkts
		return ctx.genTokObjktsLoader.load({ id: token.id })
	}

	@FieldResolver(returns => [Objkt], {
		description: "The list of gentks on which a listing is currently active. *Due to some optimization factors, this endpoint can't be called on multiple Generative Tokens at once*."
	})
	async activeListedObjkts(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
		@Arg("sort", { nullable: true }) sort: ObjktsSortInput,
		@Args() { skip, take }: PaginationArgs,
	) {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		// we force the filter to have an existing activeListing
		filters = {
			...filters,
			activeListing_exist: true,
		}
		if (token.objkts) return token.objkts
		return ctx.genTokObjktsLoader.load({ 
			id: token.id, 
			filters, 
			sort, 
			skip, 
			take
		})
	}

	@FieldResolver(() => [Offer], {
		description: "Returns a list of offers on individual gentks associated with a collection"
	})
	offers(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersOffer, { nullable: true }) filters: any,
	) {
		return ctx.genTokOffersLoader.load({
			id: token.id,
			filters: filters,
		})
	}

	/**
	 * Pricing resolvers.
	 * Generative Tokens can have different pricing strategy, each one is stored
	 * in its own table and responds to its own logic. At least one of the pricing
	 * fields should be defined for a token
	 */

	@FieldResolver(returns => PricingFixed, {
		description: "The PricingFixed entity associated with the Generative Token. *It can be null if the Generative Token uses a different pricing strategy*.",
		nullable: true,
	})
	async pricingFixed(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
	) {
		return token.pricingFixed 
		|| ctx.gentkTokPricingFixedLoader.load(token.id)
	}

	@FieldResolver(returns => PricingDutchAuction, {
		description: "The PricingDutchAuction entity associated with the Generative Token. *It can be null if the Generative Token uses a different pricing strategy*.",
		nullable: true,
	})
	async pricingDutchAuction(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
	) {
		return token.pricingDutchAuction
		|| ctx.gentkTokPricingDutchAuctionLoader.load(token.id)
	}

	@FieldResolver(returns => [Split], {
		description: "The list of splits on the primary market"
	})
	async splitsPrimary(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
	) {
		return ctx.gentTokSplitsPrimaryLoader.load(token.id)
	}

	@FieldResolver(returns => [Split], {
		description: "The list of splits on the secondary market"
	})
	async splitsSecondary(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
	) {
		return ctx.gentTokSplitsSecondaryLoader.load(token.id)
	}

	@FieldResolver(returns => [Reserve], {
		description: "The reserves of the Generative Token. Artists can define reserves to control the distribution of their tokens."
	})
	reserves(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
	) {
		return ctx.genTokReservesLoader.load(token.id)
	}

	@FieldResolver(returns => Number, {
		description: "The number of objkts generated by the Generative Token"
	})
	async objktsCount(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
	) {
		return ctx.genTokObjktsCountLoader.load(token.id)
	}

	@FieldResolver(returns => [Report], {
		description: "A list of the reports made on the Generative Token",
	})
	reports(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.reports) return token.reports
		return ctx.genTokReportsLoader.load(token.id)
	}

  @FieldResolver(returns => User, {
		description: "The account who authored the Generative Token. Due to how collaborations are handled, it is also required to fetch the eventual collaborators on the account to know if it's a single or multiple authors."
	})
	author(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.author) return token.author
		return ctx.usersLoader.load(token.authorId)
	}

	@FieldResolver(returns => [Action], {
		description: "A list of all the actions related to the Generative Token. **Not optimized to be run on multiple generative tokens at once, please use carefully*.",
	})
	actions(
		@Root() token: GenerativeToken,
		@Arg("filters", FiltersAction, { nullable: true}) filters: any,
		@Arg("sort", { nullable: true }) sortArgs: ActionsSortInput,
		@Args() { skip, take }: PaginationArgs,
	): Promise<Action[]> {
		// default arguments
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		sortArgs = defaultSort(sortArgs, {
			createdAt: "DESC"
		})
	
		// create the query
		let query = Action.createQueryBuilder("action").select()

		// add the generic filters
		query.where(processFilters(filters))

		// add the filters to target the token only
		query.andWhere("action.tokenId = :id", { id: token.id })

		// add the sort arguments
		for (const sort in sortArgs) {
			query.addOrderBy(`action.${sort}`, sortArgs[sort])
		}

		// add pagination
		query.skip(skip)
		query.take(take)

		return query.getMany()
	}

	@FieldResolver(returns => MarketStats, { 
		nullable: true,
		description: "The pre-computed marketstats of the Generative Token. *Please note that those stats may not be in perfect sync with up-to-date data due to optimization reasons*. Please refer to the **{ to }** field to see when the data was last computed."
	})
	async marketStats(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	): Promise<MarketStats> {
		if (token.marketStats) return token.marketStats
		return ctx.genTokMarketStatsLoader.load(token.id)
	}
		
	@FieldResolver(returns => [MarketStatsHistory], {
		description: "The history of the market stats over time. Can be used to build **GGGG-G-GG-GGGRAPH**"
	})
	async marketStatsHistory(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
		@Arg("filters", { nullable: false }) filters: MarketStatsHistoryInput,
	) {
		return ctx.genTokMarketStatsHistoryLoader.load({
			id: token.id,
			from: filters.from,
			to: filters.to
		})
	}

	@FieldResolver(returns => [GraphQLJSONObject], {
		nullable: true,
		description: "**[HEAVY - please no abuse]** Returns a list of the different features and their possible values",
	})
	async features(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
	) {
		return ctx.genTokObjktFeaturesLoader.load(token.id) 
	}

	@FieldResolver(returns => String, {
		nullable: true,
		description: "If any, returns the moderation reason associated with the Generative Token",
	})
	async moderationReason(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
	) {
		if (token.moderationReasonId == null) return null
		if (token.moderationReason) return token.moderationReason
		return ctx.moderationReasonsLoader.load(token.moderationReasonId)
	}
  
  @Query(returns => [GenerativeToken], {
		description: "Generic endpoint to query the Generative Tokens. Go-to endpoint to explore the Generative Tokens published on the platform, requires pagination and provides sort and filter options. *Flagged tokens are NOT excluded by this endpoint*."
	})
	async generativeTokens(
		@Args() { skip, take }: PaginationArgs,
		@Arg("sort", { nullable: true }) sortArgs: GenerativeSortInput,
		@Arg("filters", GenerativeFilters, { nullable: true }) filters: any
	): Promise<GenerativeToken[]> {
		// default arguments
		if (!sortArgs || Object.keys(sortArgs).length === 0) {
			sortArgs = {
				lockEnd: "DESC"
			}
		}
		[skip, take] = useDefaultValues([skip, take], [0, 20])

		let query = GenerativeToken.createQueryBuilder("token").select()

		// if their is a search string, we first make a request to the search engine to get results
		if (filters?.searchQuery_eq) {
			const searchResults = await searchIndexGenerative.search(filters.searchQuery_eq, { 
				hitsPerPage: 5000
			})
			const ids = searchResults.hits.map(hit => hit.objectID)
			query.whereInIds(ids)

			// if the sort option is relevance, we remove the sort arguments as the order
			// of the search results needs to be preserved
			if (sortArgs.relevance && ids.length > 1) {
				// then we manually set the order using array_position
				const relevanceList = ids.map((id, idx) => `${id}`).join(', ')
				query.addOrderBy(`array_position(array[${relevanceList}], token.id)`)
			}
		}

		// delete the relevance sort arg if any at this point
		if (sortArgs.relevance) {
			delete sortArgs.relevance
		}

		// CUSTOM FILTERS
	
		// filter for the field author verified
		if (filters?.authorVerified_eq != null) {
			query.leftJoin("token.author", "author")
			if (filters.authorVerified_eq === true) {
				query.andWhere("author.flag = 'VERIFIED'")
			}
			else {
				query.andWhere("author.flag != 'VERIFIED'")
			}
		}

		// add filter for the locked / unlocked tokens
		if (filters?.locked_eq != null) {
			// filter the unlocked tokens
			if (filters.locked_eq === false) {
				query.andWhere({
					lockEnd: LessThanOrEqual(new Date())
				})
			}
			// filter only the locked tokens
			else if (filters.locked_eq === true) {
				query.andWhere({
					lockEnd: MoreThan(new Date())
				})	
			}
		}

		// filter for the field mint progress
		if (filters?.mintProgress_eq != null) {
			// if we want to filter all completed collections
			if (filters.mintProgress_eq === "COMPLETED") {
				query.andWhere("token.balance = 0")
			}
			// if we want to filter all the ongoing collections
			else if (filters.mintProgress_eq === "ONGOING") {
				query.andWhere("token.balance > 0")
			}
			// if we want to filter all the collections close to be finished
			else if (filters.mintProgress_eq === "ALMOST") {
				query.andWhere("token.balance::decimal / token.supply < 0.1 AND token.balance > 0")
			}
		}

		// we add the join based on the existence of certain sort / filter
		if (filters?.price_gte || filters?.price_lte || sortArgs.price
			|| filters?.pricingMethod_eq) {
			// we inner join if a filter on pricing method is done
			if (filters?.pricingMethod_eq === GentkTokPricing.FIXED) {
				query.innerJoinAndSelect("token.pricingFixed", "pricingFixed")
			}
			else {
				query.leftJoinAndSelect("token.pricingFixed", "pricingFixed")
			}
			// we inner join if a filter on pricing method is done
			if (filters?.pricingMethod_eq === GentkTokPricing.DUTCH_AUCTION) {
				query.innerJoinAndSelect("token.pricingDutchAuction", "pricingDutchAuction")
			}
			else {
				query.leftJoinAndSelect("token.pricingDutchAuction", "pricingDutchAuction")
			}
		}

		// process the filters on the prices
		if (filters?.price_gte) {
			query.andWhere(new Brackets(qb => {
				qb.where("pricingFixed.price >= :price_gte", { 
						price_gte: filters.price_gte 
					})
					.orWhere("pricingDutchAuction.restingPrice >= :price_gte", { 
						price_gte: filters.price_gte 
					})
			}))
		}
		if (filters?.price_lte) {
			query.andWhere(new Brackets(qb => {
				qb.where("pricingFixed.price <= :price_lte", { 
						price_lte: filters.price_lte 
					})
					.orWhere("pricingDutchAuction.restingPrice <= :price_lte", { 
						price_lte: filters.price_lte 
					})
			}))
		}

		// add the where clauses
		const processedFilters = processGenerativeFilters(filters)
		for (const filter of processedFilters) {
			query.andWhere(filter)
		}

		// add the sort arguments
		for (const field in sortArgs) {
			// since price is defined in different tables, we need to craft a generic
			// query to sort all the items in an elegant fashion
			// TODO: support dutch auctions
			if (field === "price") {
				query.addOrderBy(
					"pricingFixed.price",
					sortArgs[field],
					"NULLS LAST"
				)
			}
			else {
				query.addOrderBy(`token.${field}`, sortArgs[field])
			}
		}

		// add pagination
		query.take(take)
		query.skip(skip)

		return query.getMany()
	}

	@Query(returns => GenerativeToken, {
		nullable: true,
		description: "Get a Generative Token by its ID or SLUG. One of those 2 must be provided for the endpoint to perform a search in the DB."
	})
	generativeToken(
		@Arg('id', { nullable: true }) id: number,
		@Arg('slug', { nullable: true }) slug: string,
	): Promise<GenerativeToken|undefined> {
		if (id == null && slug == null) {
			throw new ApolloError("Either ID or SLUG must be supllied.")
		}
		if (id != null) {
			return GenerativeToken.findOne(id)
		}
		else {
			return GenerativeToken.findOne({
				where: { slug }
			})
		}
	}

	@Query(returns => GenerativeToken, { 
		nullable: true,
		description: "Returns a random Generative Token among all the available Generative Tokens. This implementation does not guarantee that a Generative Token will be outputted altough the chances for a NULL value to be returned are really low.",
	})
	async randomGenerativeToken(): Promise<GenerativeToken|undefined> {
		const highest = await GenerativeToken.createQueryBuilder("token")
			.orderBy("token.id", "DESC")
			.limit(1)
			.getOne()
		const count = highest?.id
		let token: GenerativeToken|undefined = undefined
		if (count) {
			let id: number
			let i = 0
			while (!token || (token.flag !== GenTokFlag.CLEAN && token.flag !== GenTokFlag.NONE && token.flag !== undefined)) {
				id = (Math.random()*count)|0
				token = await GenerativeToken.findOne(id)
				if (++i > 6) {
					return undefined
				}
			}
		}
		return token
	}
}