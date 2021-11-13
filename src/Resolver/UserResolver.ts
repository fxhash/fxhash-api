import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Action } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { PaginationArgs } from "./Arguments/Pagination"

@Resolver(User)
export class UserResolver {
  @FieldResolver(returns => [Objkt])
	objkts(
		@Root() user: User,
		@Ctx() ctx: RequestContext
	) {
		if (user.objkts) return user.objkts
		return ctx.userObjktsLoader.load(user.id)
	}

  @FieldResolver(returns => [GenerativeToken])
	generativeTokens(
		@Root() user: User,
		@Ctx() ctx: RequestContext
	) {
		if (user.generativeTokens) return user.generativeTokens
		return ctx.userGenToksLoader.load(user.id)
	}

  @FieldResolver(returns => [Offer])
	offers(
		@Root() user: User,
		@Ctx() ctx: RequestContext
	) {
		if (user.offers) return user.offers
		return ctx.userOffersLoader.load(user.id)
	}

  @FieldResolver(returns => [Action])
	actionsAsIssuer(
		@Root() user: User,
		@Ctx() ctx: RequestContext
	) {
		if (user.actionsAsIssuer) return user.actionsAsIssuer
		return ctx.userIssuerActionsLoader.load(user.id)
	}

  @FieldResolver(returns => [Action])
	actionsAsTarget(
		@Root() user: User,
		@Ctx() ctx: RequestContext
	) {
		if (user.actionsAsTarget) return user.actionsAsTarget
		return ctx.userTargetActionsLoader.load(user.id)
	}
  
  @Query(returns => [User])
	users(
		@Args() { skip, take }: PaginationArgs
	): Promise<User[]> {
		return User.find({
			order: {
				createdAt: "ASC"
			},
			skip,
			take,
		})
	}

	@Query(returns => User, { nullable: true })
	async user(
		@Arg('id', { nullable: true }) id: string,
		@Arg('name', { nullable: true }) name: string,
	): Promise<User|undefined|null> {
		let user: User|null|undefined = null
		if (id)
			user = await User.findOne(id)
		else if (name)
			user = await User.findOne({ where: { name } })
		return user
	}
}