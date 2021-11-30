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
import { PaginationArgs } from "./Arguments/Pagination"
import { ObjktsSortArgs } from "./Arguments/Sort"

@Resolver(GenerativeToken)
export class GenTokenResolver {
  @FieldResolver(returns => [Objkt])
	async objkts(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
		@Args() sort: ObjktsSortArgs
	) {
		if (token.objkts) return token.objkts
		return ctx.genTokObjktsLoader.load({ id: token.id, filters, sort })
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
			take: take
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
		})
	}
  
  @Query(returns => [GenerativeToken])
	reportedGenerativeTokens(
		@Args() { skip, take }: PaginationArgs
	): Promise<GenerativeToken[]> {
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
		const tok = await GenerativeToken.createQueryBuilder()
			.select("*")
			.from(GenerativeToken, "token")
			.where("token.flag = :flag", { flag: GenTokFlag.CLEAN })
			.orWhere("token.flag = :flag", { flag: GenTokFlag.NONE })
			.orderBy("RANDOM()")
			.limit(1)
			.execute()
		return tok[0] || null
	}
}