import { Arg, Args, Ctx, Field, FieldResolver, Int, ObjectType, Query, Resolver, Root } from "type-graphql"
import { Brackets, IsNull, Not } from "typeorm"
import { Action, FiltersAction } from "../Entity/Action"
import { GenerativeFilters, GenerativeToken, GenTokFlag } from "../Entity/GenerativeToken"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { Listing } from "../Entity/Listing"
import { User, UserAuthorization, UserFilters, UserType } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { BigPaginationArgs, PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { ActionsSortInput, ArticleSortInput, defaultSort, GenerativeSortInput, ObjktsSortInput, OffersSortInput, UserSortInput } from "./Arguments/Sort"
import { mapUserAuthorizationIdsToEnum } from "../Utils/User"
import { processFilters, processUserFilters } from "../Utils/Filters"
import { FiltersOffer, Offer } from "../Entity/Offer"
import { searchIndexUser } from "../Services/Search"
import { objktQueryFilter } from "../Query/Filters/Objkt"
import { Article, ArticleFilters } from "../Entity/Article"
import { ArticleLedger } from "../Entity/ArticleLedger"
import { MediaImage } from "../Entity/MediaImage"


@Resolver(User)
export class UserResolver {
	@FieldResolver(returns => [UserAuthorization], {
		description: "Users can have granular moderation rights to certain features on the fxhash contracts. This field outputs a list of those authorizations in a human readable way.",
	})
	authorizations(
		@Root() user: User,
	) {
		return mapUserAuthorizationIdsToEnum(user.authorizations)
	}

  @FieldResolver(returns => [Objkt], {
		description: "The gentks owned by the user. Can be used to explore their collection using various filters."
	})
	async objkts(
		@Root() user: User,
		@Args() { skip, take }: PaginationArgs,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersObjkt, { nullable: true }) filters: any,
		@Arg("sort", { nullable: true }) sort: ObjktsSortInput,
	) {
		// default values
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		if (!sort || Object.keys(sort).length === 0) {
			sort = {
				id: "DESC"
			}
		}

		let query = Objkt.createQueryBuilder("objkt")
		query.where("objkt.ownerId = :ownerId", { ownerId: user.id })

		// we add the issuer relationship because it's required for most of the
		// tasks, and also requested most of the time by the API calls
		query.leftJoinAndSelect("objkt.issuer", "issuer")

		// FILTER / SORT
		query = await objktQueryFilter(
			query,
			{
				general: filters
			},
			sort
		)

		// pagination
		query.offset(skip)
		query.limit(take)

		return query.getMany()
	}

	@FieldResolver(returns => MediaImage, {
		description: "The media entity associated with the user avatar, provides additional informations on the avatar such as resolution, base64 placeholder and media type.",
		nullable: true,
	})
	avatarMedia(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
	) {
		if (!user.avatarMediaId) return null
		if (user.avatarMedia) return user.avatarMedia
		return ctx.mediaImagesLoader.load(user.avatarMediaId)
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

		// FILTER / SORT
		query = await objktQueryFilter(
			query,
			{
				general: filters
			},
		)

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
		query = await objktQueryFilter(
			query,
			{
				general: filters
			},
		)

		return query.getMany()
	}

  @FieldResolver(returns => [GenerativeToken], {
		description: "Returns the tokens authored by the user, either directly or as a collaboration through a collaboration contract."
	})
	async generativeTokens(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Args() { skip, take }: PaginationArgs,
		@Arg("sort", { nullable: true }) sort: GenerativeSortInput,
		@Arg("filters", GenerativeFilters, { nullable: true }) filters: any
	) {
		// default skip/takr
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		// default sort
		if (!sort || Object.keys(sort).length === 0) {
			sort = {
				mintOpensAt: "DESC"
			}
		}

		return ctx.usersGenToksLoader.load({
			id: user.id,
			filters: filters,
			sort: sort,
			skip: skip,
			take: take,
		})
	}

	@FieldResolver(returns => [Article], {
		description: "The Articles authored by the user."
	})
	articles(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Args() { skip, take }: PaginationArgs,
		@Arg("sort", { nullable: true }) sort: ArticleSortInput,
		@Arg("filters", ArticleFilters, { nullable: true }) filters: any
	) {
		return ctx.usersArticlesLoader.load({
			id: user.id,
			filters: filters,
			sort: sort,
			skip: skip,
			take: take,
		})
	}

	@FieldResolver(returns => [ArticleLedger], {
		description: "The Articles owned by the user."
	})
	articlesOwned(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
	) {
		return ctx.usersArticleLedgersLoader.load(user.id)
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
		query.andWhere("listing.acceptedAt is null")
		query.andWhere("listing.cancelledAt is null")

		// order results by creation time
		query.addOrderBy("listing.createdAt", "DESC")

		// add pagination
		query.skip(skip)
		query.take(take)

		return query.getMany()
	}

	@FieldResolver(returns => [Offer], {
		description: "Returns all the offers made by the user. Can be filtered."
	})
	offersSent(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersOffer, { nullable: true }) filters: any,
		@Arg("sort", { nullable: true }) sort: OffersSortInput
	) {
		// default sort
		if (!sort || Object.keys(sort).length === 0) {
			sort = {
				createdAt: "DESC"
			}
		}

		return ctx.userOffersSentLoader.load({
			id: user.id,
			filters: filters,
			sort: sort
		})
	}

	@FieldResolver(returns => [Offer], {
		description: "Returns all the offers made by users on tokens owned by the given user."
	})
	offersReceived(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersOffer, { nullable: true }) filters: any,
		@Arg("sort", { nullable: true }) sort: OffersSortInput
	) {
		// default sort
		if (!sort || Object.keys(sort).length === 0) {
			sort = {
				createdAt: "DESC"
			}
		}

		return ctx.userOffersReceivedLoader.load({
			id: user.id,
			filters: filters,
			sort: sort
		})
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

	@FieldResolver(returns => [Action], {
		description: "The actions in which the user is either the issuer or the target. Paginated, can be filtered and sorted.",
	})
	async actions(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Arg("filters", FiltersAction, { nullable: true}) filters: any,
		@Arg("sort", { nullable: true }) sortArgs: ActionsSortInput,
		@Args() { skip, take }: PaginationArgs,
	) {
		// default arguments
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		sortArgs = defaultSort(sortArgs, {
			createdAt: "DESC"
		})

		// create the query
		let query = Action.createQueryBuilder("action").select()

		// add the generic filters
		query.where(processFilters(filters))

		// add the filters to target the user only
		query.andWhere(new Brackets(qb => {
			qb.where("action.issuerId = :userId", { userId: user.id })
			qb.orWhere("action.targetId = :userId", { userId: user.id })
		}))

		// add the sort arguments
		for (const sort in sortArgs) {
			query.addOrderBy(`action.${sort}`, sortArgs[sort])
		}

		// add pagination
		query.skip(skip)
		query.take(take)

		return query.getMany()
	}

	@FieldResolver(returns => [Action], {
		description: "The secondary market sales in which the user is involved as a recipient (either as the direct seller or as an artist)"
	})
	async sales(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Args() { skip, take }: PaginationArgs
	) {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return ctx.usersSalesLoader.load({ id: user.id, skip, take })
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

  @Query(returns => [User], {
		description: "Some unfiltered exploration of the users, with pagination."
	})
	async users(
		@Args() { skip, take }: BigPaginationArgs,
		@Arg("filters", UserFilters, { nullable: true }) filters: any,
		@Arg("sort", { nullable: true }) sortArgs: UserSortInput,
	): Promise<User[]> {
		// default parameters
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		if (!sortArgs || Object.keys(sortArgs).length === 0) {
			sortArgs = {
				createdAt: "ASC"
			}
		}

		// create the query
		const query = User.createQueryBuilder("user").select()

		// if search query, trigger a search first
		if (filters?.searchQuery_eq) {
			const searchResults = await searchIndexUser.search(
				filters.searchQuery_eq,
				{
					hitsPerPage: 200
				}
			)
			const ids = searchResults.hits.map(hit => hit.objectID)
			query.whereInIds(ids)

			// if the sort option is relevance, we remove the sort arguments as the order
			// of the search results needs to be preserved
			if (sortArgs.relevance && ids.length > 1) {
				// then we manually set the order using array_position
				const relevanceList = ids.map((id, idx) => `$${idx+1}`).join(', ')
				query.addOrderBy(`array_position(array[${relevanceList}], user.id)`)
			}
		}

		// just delete relevance by sort at this point anyway
		if (sortArgs.relevance) {
			delete sortArgs.relevance
		}

		// add sort
		for (const field in sortArgs) {
			query.addOrderBy(`user.${field}`, sortArgs[field])
		}

		// apply the filters if any
		const processedFilters = processUserFilters(filters)
		for (const filter of processedFilters) {
			query.andWhere(filter)
		}

		// pagination
		if (sortArgs.relevance) {
			query.offset(skip)
			query.limit(take)
		} else {
			query.skip(skip)
			query.take(take)
		}
		return query.getMany()
	}

	@Query(returns => User, {
		nullable: true,
		description: "Find a user by it's ID (tezos address) or by it's name as they set it on the fxhash user register."
	})
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
