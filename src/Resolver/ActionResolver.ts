import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Action, FiltersAction } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { processFilters } from "../Utils/Filters"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"

@Resolver(Action)
export class ActionResolver {
  @FieldResolver(returns => User, { nullable: true })
	issuer(
		@Root() action: Action,
		@Ctx() ctx: RequestContext
	) {
    if (action.issuerId == null) return null
		if (action.issuer) return action.issuer
		return ctx.usersLoader.load(action.issuerId)
	}

  @FieldResolver(returns => User, { nullable: true })
	target(
		@Root() action: Action,
		@Ctx() ctx: RequestContext
	) {
    if (action.targetId == null) return null
		if (action.target) return action.target
		return ctx.usersLoader.load(action.targetId)
	}

  @FieldResolver(returns => GenerativeToken, { nullable: true })
	token(
		@Root() action: Action,
		@Ctx() ctx: RequestContext
	) {
    if (action.tokenId == null) return null
		if (action.token) return action.token
		return ctx.genTokLoader.load(action.tokenId)
	}

  @FieldResolver(returns => Objkt, { nullable: true })
	objkt(
		@Root() action: Action,
		@Ctx() ctx: RequestContext
	) {
    if (action.objktId == null) return null
		if (action.objkt) return action.objkt
		return ctx.objktsLoader.load(action.objktId)
	}
  
  @Query(returns => [Action])
	async actions(
		@Args() { skip, take }: PaginationArgs,
		@Arg("filters", FiltersAction, { nullable: true}) filters: any
	): Promise<Action[]> {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return Action.find({
			where: processFilters(filters),
			order: {
				createdAt: "ASC"
			},
			skip,
			take,
		})
	}
}