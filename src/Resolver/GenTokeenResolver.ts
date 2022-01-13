import { ApolloError } from "apollo-server-errors"
import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Equal, In, LessThanOrEqual, MoreThan } from "typeorm"
import { Action, FiltersAction } from "../Entity/Action"
import { GenerativeFilters, GenerativeToken, GenTokFlag } from "../Entity/GenerativeToken"
import { MarketStats } from "../Entity/MarketStats"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { Report } from "../Entity/Report"
import { User } from "../Entity/User"
import { searchIndexGenerative } from "../Services/Search"
import { RequestContext } from "../types/RequestContext"
import { processFilters, processGenerativeFilters } from "../Utils/Filters"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { GenerativeSortInput, ObjktsSortArgs } from "./Arguments/Sort"

@Resolver(GenerativeToken)
export class GenTokenResolver {
  @FieldResolver(returns => [Objkt])
	async objkts(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
		@Args() { skip, take }: PaginationArgs,
		@Args() sort: ObjktsSortArgs
	) {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		if (token.objkts) return token.objkts
		return ctx.genTokObjktsLoader.load({ id: token.id, filters, sort, skip, take })
	}

  @FieldResolver(returns => [Objkt])
	async entireCollection(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.objkts) return token.objkts
		return ctx.genTokObjktsLoader.load({ id: token.id })
	}

	@FieldResolver(returns => [Objkt])
	async offers(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
		@Args() { skip, take }: PaginationArgs,
		@Args() sort: ObjktsSortArgs
	) {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		if (token.objkts) return token.objkts
		return ctx.genTokObjktsLoader.load({ id: token.id, filters, sort, skip, take })
	}

	@FieldResolver(returns => Number)
	async objktsCount(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
	) {
		return ctx.genTokObjktsCountLoader.load(token.id)
	}

	@FieldResolver(returns => [Report])
	reports(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.reports) return token.reports
		return ctx.genTokReportsLoader.load(token.id)
	}

	@FieldResolver(returns => [Objkt])
	latestObjkts(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.objkts) return token.objkts
		return ctx.genTokLatestObjktsLoader.load(token.id)
	}

  @FieldResolver(returns => User)
	author(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.author) return token.author
		return ctx.usersLoader.load(token.authorId)
	}

	@FieldResolver(returns => [Action])
	latestActions(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.actions) return token.actions
		return ctx.genTokLatestActionsLoader.load(token.id)
	}

	@FieldResolver(returns => [Action])
	actions(
		@Root() token: GenerativeToken,
		@Args() { skip, take }: PaginationArgs,
		@Arg("filters", FiltersAction, { nullable: true}) filters: any
	): Promise<Action[]> {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return Action.find({
			where: {
				token: token.id,
				...processFilters(filters)
			},
			order: {
				createdAt: "DESC",
				type: "DESC"
			},
			skip: skip,
			take: take,
			cache: 10000
		})
	}

	@FieldResolver(returns => MarketStats)
	async marketStats(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	): Promise<MarketStats> {
		if (token.marketStats) return token.marketStats
		return ctx.genTokMarketStatsLoader.load(token.id)
	}
  
  @Query(returns => [GenerativeToken])
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

		// TODO
		// Because the mint_time wasn't transfered properly, the lock time is not a good
		// sort option, especially in ASC order. in DESC, it works because new tokens
		// cover the mistake, but the other way arround needs to be hacked with the
		// ID instead, and so until data is transfered to new contracts again, and mistake
		// is fixed.
		if (sortArgs.lockEnd === "ASC") {
			delete sortArgs.lockEnd
			// @ts-ignore
			sortArgs.id = "ASC"
		}

		let query = GenerativeToken.createQueryBuilder("token")
			.select()

		// if their is a search string, we first make a request to the search engine to get results
		if (filters?.searchQuery_eq) {
			const searchResults = await searchIndexGenerative.search(filters.searchQuery_eq, { 
				hitsPerPage: 5000
			})
			const ids = searchResults.hits.map(hit => hit.objectID)
			query = query.whereInIds(ids)
		}
		
		// add the filter on the flags
		query = query.andWhere(`token.flag IN('${GenTokFlag.CLEAN}', '${GenTokFlag.NONE}')`)
		// add filter to only get unlocked tokens
		query = query.andWhere({
			lockEnd: LessThanOrEqual(new Date())
		})

		// CUSTOM FILTERS
		// filter for the field author verified
		if (filters?.authorVerified_eq != null) {
			query = query.leftJoin("token.author", "author")
			if (filters.authorVerified_eq === true) {
				query = query.andWhere("author.flag = 'VERIFIED'")
			}
			else {
				query = query.andWhere("author.flag != 'VERIFIED'")
			}
		}

		// filter for the field mint progress
		if (filters?.mintProgress_eq != null) {
			// if we want to filter all completed collections
			if (filters.mintProgress_eq === "COMPLETED") {
				query = query.andWhere("token.balance = 0")
			}
			// if we want to filter all the ongoing collections
			else if (filters.mintProgress_eq === "ONGOING") {
				query = query.andWhere("token.balance > 0")
			}
			// if we want to filter all the collections close to be finished
			else if (filters.mintProgress_eq === "ALMOST") {
				query = query.andWhere("token.balance::decimal / token.supply < 0.1 AND token.balance > 0")
			}
		}

		// add the where clauses
		const processedFilters = processGenerativeFilters(filters)
		for (const filter of processedFilters) {
			query = query.andWhere(filter)
		}

		// add the sort arguments
		for (const field in sortArgs) {
			query = query.addOrderBy(`token.${field}`, sortArgs[field])
		}

		// add pagination
		query = query.take(take)
		query = query.skip(skip)

		// cache
		query = query.cache(10000)

		return query.getMany()
	}

	@Query(returns => [GenerativeToken])
	lockedGenerativeTokens(
		@Args() { skip, take }: PaginationArgs
	): Promise<GenerativeToken[]> {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return GenerativeToken.find({
			where: [{
				flag: In([GenTokFlag.CLEAN, GenTokFlag.NONE]),
				lockEnd: MoreThan(new Date())
			}],
			order: {
				id: "ASC",
			},
			skip,
			take,
			cache: 10000
		})
	}
  
  @Query(returns => [GenerativeToken])
	reportedGenerativeTokens(
		@Args() { skip, take }: PaginationArgs
	): Promise<GenerativeToken[]> {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return GenerativeToken.find({
			where: [{
				flag: GenTokFlag.AUTO_DETECT_COPY
			},{
				flag: GenTokFlag.REPORTED
			},{
				flag: GenTokFlag.MALICIOUS
			}],
			order: {
				id: "DESC",
			},
			skip,
			take,
			cache: 60000
		})
	}

  @Query(returns => [GenerativeToken], { nullable: true })
	async generativeTokensByIds(
		@Arg("ids", type => [Number]) ids: number[]
	): Promise<GenerativeToken[]> {
		const tokens = await GenerativeToken.find({
			where: [{
				id: In(ids),
				flag: Equal(GenTokFlag.CLEAN)
			},{
				id: In(ids),
				flag: Equal(GenTokFlag.NONE)
			}],
			take: 100
		})
		// @ts-ignore
		return ids.map(id => tokens.find(tok => tok.id == id)).filter(tok => !!tok)
	}

	@Query(returns => GenerativeToken, { nullable: true })
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

	@Query(returns => GenerativeToken, { nullable: true })
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
				if (++i > 4) {
					return undefined
				}
			}
		}
		return token
	}
}