import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Not } from "typeorm"
import { Action } from "../Entity/Action"
import { GenerativeToken, GenTokFlag } from "../Entity/GenerativeToken"
import { FiltersObjkt, Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { User } from "../Entity/User"
import { searchIndexGenerative } from "../Services/Search"
import { RequestContext } from "../types/RequestContext"
import { processFilters, processUserCollectionFilters } from "../Utils/Filters"
import { userCollectionSortTableLevels } from "../Utils/Sort"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { UserCollectionSortInput } from "./Arguments/Sort"

@Resolver(User)
export class UserResolver {
  @FieldResolver(returns => [Objkt])
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

		// if their is a search string, we leverage the fact that gentks can be searched
		// using the Generative Token index, because they are all children of it
		if (filters?.searchQuery_eq) {
			const searchResults = await searchIndexGenerative.search(filters.searchQuery_eq, { 
				hitsPerPage: 5000
			})
			const ids = searchResults.hits.map(hit => hit.objectID)
			query = query.andWhere("issuer.id IN (:...issuerIds)", { issuerIds: ids })

			// if the sort option is relevance, we remove the sort arguments as the order
			// of the search results needs to be preserved
			if (sort.relevance) {
				delete sort.relevance
				// then we manually set the order using array_position
				const relevanceList = ids.map((id, idx) => `${id}`).join(', ')
				query = query.addOrderBy(`array_position(array[${relevanceList}], objkt.id)`)
			}
		}

		// process the filters directly against the objkt table
		const processedFilters = processUserCollectionFilters(filters)
		for (const filter of processedFilters) {
			query = query.andWhere(filter)
		}

		// custom filters
		if (filters) {
			// all the filters related to the author
			if (filters.author_eq != null || filters.authorVerified_eq != null) {
				// we need the author so we join it (we can select as it's almost always requested)
				query = query.leftJoinAndSelect("issuer.author", "author")
				// filter for a specific author
				if (filters.author_eq != null) {
					query = query.andWhere("author.id = :authorId", { authorId: filters.author_eq })
				}
				// filters for verified authors only
				if (filters.authorVerified_eq != null) {
					if (filters.authorVerified_eq === true) {
						query = query.andWhere("author.flag = 'VERIFIED'")
					}
					else {
						query = query.andWhere("author.flag != 'VERIFIED'")
					}
				}
			}

			// the mint progress
			if (filters.mintProgress_eq != null) {
				// if we want to filter all completed collections
				if (filters.mintProgress_eq === "COMPLETED") {
					query = query.andWhere("issuer.balance = 0")
				}
				// if we want to filter all the ongoing collections
				else if (filters.mintProgress_eq === "ONGOING") {
					query = query.andWhere("issuer.balance > 0")
				}
				// if we want to filter all the collections close to be finished
				else if (filters.mintProgress_eq === "ALMOST") {
					query = query.andWhere("issuer.balance::decimal / issuer.supply < 0.1 AND issuer.balance > 0")
				}
			}

			// filter for some issuers only
			if (filters.issuer_in != null) {
				query = query.andWhere("issuer.id IN (:...issuerIdFilters)", { issuerIdFilters: filters.issuer_in })
			}

			// if we only want the items with an offer
			if (filters.offer_ne === null) {
				query = query.innerJoinAndSelect("objkt.offer", "offer")
			}
		}


		// SORTING

		// filter the sort arguments that can be run on the objkt table directly
		const levelledSortArguments = userCollectionSortTableLevels(sort)
		for (const field in levelledSortArguments.primaryTable) {
			query = query.addOrderBy(`"objkt"."${field}"`, levelledSortArguments.primaryTable[field], "NULLS LAST")
		}
		// sorting on sub fields 
		if (levelledSortArguments.secondaryTable.collectedAt) {
			// we need to find the last offer accepted for the the objkt
			query = query.leftJoin("objkt.actions", "action", "action.objktId = objkt.id AND action.type = 'OFFER_ACCEPTED'")
			query = query.addOrderBy("action.createdAt", levelledSortArguments.secondaryTable.collectedAt, "NULLS LAST")
		}

		// pagination
		query = query.offset(skip)
		query = query.limit(take)

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

  @FieldResolver(returns => [Offer])
	offers(
		@Root() user: User,
		@Ctx() ctx: RequestContext,
		@Args() { skip, take }: PaginationArgs
	) {
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return Offer.find({
			where: {
				issuer: user.id
			},
			order: {
				id: "DESC"
			},
			skip,
			take,
			// cache: 10000
		})
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