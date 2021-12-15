import { ApolloError } from "apollo-server-errors"
import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { generateFilterType } from "type-graphql-filter"
import { Equal, In, Not } from "typeorm"
import { Action, FiltersAction } from "../Entity/Action"
import { GenerativeToken, GenTokFlag } from "../Entity/GenerativeToken"
import { MarketStats } from "../Entity/MarketStats"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { Report } from "../Entity/Report"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { processFilters } from "../Utils/Filters"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { ObjktsSortArgs } from "./Arguments/Sort"

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
	generativeTokens(
		@Args() { skip, take }: PaginationArgs
	): Promise<GenerativeToken[]> {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return GenerativeToken.find({
			where: [{
				flag: GenTokFlag.CLEAN
			},{
				flag: GenTokFlag.NONE
			}],
			order: {
				id: "DESC",
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