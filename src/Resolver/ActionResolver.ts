import { Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Action } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { PaginationArgs } from "./Arguments/Pagination"
import { GenTokenResolver } from "./GenTokeenResolver"

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
		@Args() { skip, take }: PaginationArgs
	): Promise<Action[]> {
		return Action.find({
			order: {
				createdAt: "ASC"
			},
			skip,
			take,
		})
	}
}