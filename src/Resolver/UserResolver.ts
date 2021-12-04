import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Action } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { processFilters } from "../Utils/Filters"
import { PaginationArgs } from "./Arguments/Pagination"
import { ObjktsSortArgs } from "./Arguments/Sort"

@Resolver(User)
export class UserResolver {
  @FieldResolver(returns => [Objkt])
	async objkts(
		@Root() user: User,
		@Args() { skip, take }: PaginationArgs,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
		@Args() sorts: ObjktsSortArgs
	) {
		let query = Objkt.createQueryBuilder("objkt")

		if (filters && filters.offer_ne === null) {
			query = query.innerJoinAndSelect("objkt.offer", "offer")
		}
		else {
			query = query.leftJoinAndSelect("objkt.offer", "offer")
		}

		query = query.leftJoinAndSelect("offer.issuer", "issuer")
			.where("objkt.ownerId = :ownerId", { ownerId: user.id })
			.orWhere("issuer.id = :userId", { userId: user.id })
			// .orWhere(processFilters(filters),)
			.offset(skip)
			.limit(take)
		
		// add sorting
		if (sorts && Object.keys(sorts).length > 0) {
			for (const sort in sorts) {
				if (sort === "offerPrice") {
					query = query.addOrderBy("offer.price", sorts[sort])
				}
				else if (sort === "offerCreatedAt") {
					query = query.addOrderBy("offer.createdAt", sorts[sort])
				}
				else {
					query = query.addOrderBy(`objkt.${sort}`, sorts[sort])
				}
			}
		}
		else {
			query = query.addOrderBy(`objkt.id`, "DESC")
		}

		return query.getMany()
	}

  @FieldResolver(returns => [GenerativeToken])
	generativeTokens(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Args() { skip, take }: PaginationArgs
	) {
		return GenerativeToken.find({
			where: {
				author: user.id
			},
			order: {
				id: "DESC"
			},
			skip,
			take,
			cache: 10000
		})
	}

  @FieldResolver(returns => [Offer])
	offers(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Args() { skip, take }: PaginationArgs
	) {
		return Offer.find({
			where: {
				issuer: user.id
			},
			order: {
				id: "DESC"
			},
			skip,
			take,
			cache: 10000
		})
	}

	@FieldResolver(returns => [Action])
	async actions(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Args() { skip, take }: PaginationArgs
	) {
		const ret = await Action.find({
			where: [{
				issuer: user.id
			},{
				target: user.id
			}],
			order: {
				createdAt: "DESC"
			},
			skip,
			take,
			cache: 10000
		})
		return ret
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
			cache: 10000
		})
	}

	@Query(returns => User, { nullable: true })
	async user(
		@Arg('id', { nullable: true }) id: string,
		@Arg('name', { nullable: true }) name: string,
	): Promise<User|undefined|null> {
		let user: User|null|undefined = null
		if (id)
			user = await User.findOne(id, { cache: 10000 })
		else if (name)
			user = await User.findOne({ where: { name }, cache: 10000 })
		return user
	}
}