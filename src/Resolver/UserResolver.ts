import { Arg, Args, Ctx, Field, FieldResolver, Int, ObjectType, Query, Resolver, Root } from "type-graphql"
import { IsNull, Not } from "typeorm"
import { Action } from "../Entity/Action"
import { GenerativeToken, GenTokFlag } from "../Entity/GenerativeToken"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { Listing } from "../Entity/Listing"
import { User, UserType } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { userCollectionSortTableLevels } from "../Utils/Sort"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { UserCollectionSortInput } from "./Arguments/Sort"
import { applyUserCollectionFIltersToQuery } from "./Filters/User"
import { Collaboration } from "../Entity/Collaboration"


@Resolver(User)
export class UserResolver {
  @FieldResolver(returns => [Objkt], { 
		description: "Explore the gentks owned by users" 
	})
	async objkts(
		@Root() user: User,
		@Args() { skip, take }: PaginationArgs,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
		@Arg("sort", { nullable: true }) sort: UserCollectionSortInput
	) {
		// default values
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		if (!sort || Object.keys(sort).length === 0) {
			sort = {
				id: "DESC"
			}
		}
		
		let query = Objkt.createQueryBuilder("objkt")
		query = query.where("objkt.ownerId = :ownerId", { ownerId: user.id })

		// we add the issuer relationship because it's required for most of the tasks, and
		// also requested most of the time by the API calls
		query = query.leftJoinAndSelect("objkt.issuer", "issuer")

		
		// FILTERING
		query = await applyUserCollectionFIltersToQuery(query, filters, sort)


		// SORTING

		// filter the sort arguments that can be run on the objkt table directly
		const levelledSortArguments = userCollectionSortTableLevels(sort)
		for (const field in levelledSortArguments.primaryTable) {
			query = query.addOrderBy(`"objkt"."${field}"`, levelledSortArguments.primaryTable[field], "NULLS LAST")
		}
		// sorting on sub fields 
		if (levelledSortArguments.secondaryTable.collectedAt) {
			// we need to find the last listing accepted for the the objkt
			query = query.leftJoin("objkt.actions", "action", "action.objktId = objkt.id AND action.type = 'OFFER_ACCEPTED'")
			query = query.addOrderBy("action.createdAt", levelledSortArguments.secondaryTable.collectedAt, "NULLS LAST")
		}

		// pagination
		query = query.offset(skip)
		query = query.limit(take)

		return query.getMany()
	}

	@FieldResolver(returns => [GenerativeToken], {
		description: "Given a list of filters to apply to a user's collection, outputs a list of Generative Tokens returned by the search on the Gentks, without a limit on the number of results."
	})
	async generativeTokensFromObjktFilters(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
	): Promise<GenerativeToken[]> {
		// basic query to get all the user's Generative Tokens linked to gentks they own
		let query = GenerativeToken.createQueryBuilder("issuer")
			.leftJoin("objkt", "objkt", "objkt.issuerId = issuer.id")
			.where("objkt.ownerId = :ownerId", { ownerId: user.id })

		// apply the filters
		query = await applyUserCollectionFIltersToQuery(query, filters)
		
		return query.getMany()
	}

	@FieldResolver(returns => [Objkt], { 
		description: "Returns the entire collection of a user, in token ID order"
	})
	entireCollection(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
	) {
		return ctx.userObjktsLoader.load(user.id)
	}
	
	@FieldResolver(returns => [User], {
		description: "Given a list of filters to apply to a user's collection, outputs a list of Authors returned by the search on the Gentks, without a limit on the number of results."
	})
	async authorsFromObjktFilters(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
	): Promise<User[]> {
		// basic query to get all the authors linked to a token they own
		let query = User.createQueryBuilder("author")
			.leftJoin("author.generativeTokens", "issuer")
			.leftJoin("issuer.objkts", "objkt")
			.where("objkt.ownerId = :ownerId", { ownerId: user.id })

		// apply the filters
		query = await applyUserCollectionFIltersToQuery(query, filters, undefined, true)
		
		return query.getMany()
	}

  @FieldResolver(returns => [GenerativeToken])
	generativeTokens(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Args() { skip, take }: PaginationArgs
	) {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return GenerativeToken.find({
			where: {
				author: user.id,
				flag: Not(GenTokFlag.HIDDEN)
			},
			order: {
				id: "DESC"
			},
			skip,
			take,
			// cache: 10000
		})
	}

  @FieldResolver(returns => [Listing], {
		description: "The Listings created by the user. By default, this endpoint only returns the active Listings (not cancelled not accepted). **This endpoint should only be used on a single user at once as it has not been optimized for batch yet**."
	})
	listings(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Args() { skip, take }: PaginationArgs
	) {
		[skip, take] = useDefaultValues([skip, take], [0, 20])

		let query = Listing.createQueryBuilder("listing")
			.select()
			.where("listing.issuerId = :userId", { userId: user.id })

		// filter Listings which don't "exist" anymore
		query = query.andWhere("listing.acceptedAt is null")
		query = query.andWhere("listing.cancelledAt is null")

		// order results by creation time
		query = query.addOrderBy("listing.createdAt", "DESC")

		// add pagination
		query = query.skip(skip)
		query = query.take(take)

		return query.getMany()
	}

	@FieldResolver(returns => [User], {
		nullable: true,
		description: "If the user is a regular user account, returns its list of collaboration contracts created on the fxhash collaboration contract factory.",
	})
	async collaborationContracts(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
	) {
		// if the entity is a collaboration contract, it cannot have collab contracts
		if (user.type === UserType.COLLAB_CONTRACT_V1) return null
		if (user.collaborationContracts) return user.collaborationContracts
		return ctx.userCollabContractsLoader.load(user.id)
	}

	@FieldResolver(returns => [User], {
		nullable: true,
		description: "If the user is a collaboration contract, this endpoint will return the list of collaborators on the contract.",
	})
	async collaborators(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
	) {
		// if the entity is a regular user, it cannot have collaborators directly
		if (user.type === UserType.REGULAR) return null
		if (user.collaborators) return user.collaborators
		return ctx.collabCollaboratorsLoader.load(user.id)
	}

	@FieldResolver(returns => [Action])
	async actions(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Args() { skip, take }: PaginationArgs
	) {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
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
			// cache: 10000
		})
		return ret
	}

	@FieldResolver(returns => String, {
		nullable: true,
		description: "If any, returns the moderation reason associated with the user",
	})
	async moderationReason(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
	) {
		if (user.moderationReasonId == null) return null
		if (user.moderationReason) return user.moderationReason
		return ctx.moderationReasonsLoader.load(user.moderationReasonId)
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
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return User.find({
			order: {
				createdAt: "ASC"
			},
			skip,
			take,
			// cache: 10000
		})
	}

	@Query(returns => User, { nullable: true })
	async user(
		@Arg('id', { nullable: true }) id: string,
		@Arg('name', { nullable: true }) name: string,
	): Promise<User|undefined|null> {
		let user: User|null|undefined = null
		if (id)
			user = await User.findOne(id, { 
				// cache: 10000 
			})
		else if (name)
			user = await User.findOne({ where: { name }, 
				// cache: 10000 
			})
		return user
	}
}