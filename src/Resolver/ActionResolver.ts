import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Action, FiltersAction } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { processFilters } from "../Utils/Filters"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { ActionsSortInput, defaultSort } from "./Arguments/Sort"

@Resolver(Action)
export class ActionResolver {
  @FieldResolver(returns => User, { 
		nullable: true,
		description: "The user entity which is at the origin of the action. It has a slightly different meaning for each action."
	})
	issuer(
		@Root() action: Action,
		@Ctx() ctx: RequestContext
	) {
    if (action.issuerId == null) return null
		if (action.issuer) return action.issuer
		return ctx.usersLoader.load(action.issuerId)
	}

  @FieldResolver(returns => User, {
		nullable: true,
		description: "The target entity which is the at the receiving side of the action. It has a different meaning for each action."
	})
	target(
		@Root() action: Action,
		@Ctx() ctx: RequestContext
	) {
    if (action.targetId == null) return null
		if (action.target) return action.target
		return ctx.usersLoader.load(action.targetId)
	}

  @FieldResolver(returns => GenerativeToken, {
		nullable: true,
		description: "The generative token associated with the action. Some actions, even though they are related to a generative token, doesn't have this field populated as it's only populated if really meaningful to store it."
	})
	token(
		@Root() action: Action,
		@Ctx() ctx: RequestContext
	) {
    if (action.tokenId == null) return null
		if (action.token) return action.token
		return ctx.genTokLoader.load(action.tokenId)
	}

  @FieldResolver(returns => Objkt, {
		nullable: true,
		description: "The gentk associated with the action. Some actions, even though they are related to a generative token, doesn't have this field populated as it's only populated if really meaningful to store it."
	})
	objkt(
		@Root() action: Action,
		@Ctx() ctx: RequestContext
	) {
    if (action.objktId == null) return null
		if (action.objkt) return action.objkt
		return ctx.objktsLoader.load(action.objktId)
	}
  
  @Query(returns => [Action], {
		description: "A general purpose paginated endpoint to explore the actions."
	})
	async actions(
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

		// add the sort arguments
		for (const sort in sortArgs) {
			query.addOrderBy(`action.${sort}`, sortArgs[sort])
		}

		// add pagination
		query.skip(skip)
		query.take(take)

		return query.getMany()
	}
}