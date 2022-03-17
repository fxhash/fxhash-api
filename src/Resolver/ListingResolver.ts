import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Objkt } from "../Entity/Objkt"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { ListingsSortInput } from "./Arguments/Sort"
import { processListingFilters } from "../Utils/Filters"
import { searchIndexMarketplace } from "../Services/Search"
import { FiltersListing, Listing } from "../Entity/Listing"
import { ListingID } from "./Arguments/Listing"

@Resolver(Listing)
export class ListingResolver {
  @FieldResolver(returns => User, {
		nullable: true,
		description: "The user who made the listing. *If the listing was accepted/cancelled, this may not be equal to the gentk owner*"
	})
	issuer(
		@Root() listing: Listing,
		@Ctx() ctx: RequestContext
	) {
		if (listing.issuer) return listing.issuer
		return ctx.usersLoader.load(listing.issuerId)
	}

  @FieldResolver(returns => Objkt, { 
		nullable: true,
		description: "The objkt associated with the listing."
	})
	objkt(
		@Root() listing: Listing,
		@Ctx() ctx: RequestContext
	) {
		if (listing.objkt) return listing.objkt
		return ctx.objktsLoader.load(listing.objktId)
	}
  
  @Query(returns => [Listing],{
		description: "The go-to endpoint to explore Listings on the marketplace. This endpoint both returns Listings made on the old and new marketplace contracts. **By default, only returns active listings (not accepted nor cancelled)**"
	})
	async listings(
		@Args() { skip, take }: PaginationArgs,
		@Arg("sort", { nullable: true }) sortArgs: ListingsSortInput,
		@Arg("filters", FiltersListing, { nullable: true }) filters: any
	): Promise<Listing[]> {
		// default sort argument
		if (!sortArgs || Object.keys(sortArgs).length === 0) {
			sortArgs = {
				createdAt: "DESC"
			}
		}

		// we add some default filters so that by default, we don't return listings
		// which were either accepted or cancelled
		filters = {
			acceptedAt_exist: false,
			cancelledAt_exist: false,
			...filters,
		}

		// default [skip, take} arguments
		;[skip, take] = useDefaultValues([skip, take], [0, 20])

		// start building the query
		let query = Listing.createQueryBuilder("listing").select()

		// if their is a search string, we first make a request to the search engine to get results
		if (filters?.searchQuery_eq) {
			const searchResults = await searchIndexMarketplace.search(filters.searchQuery_eq, { 
				hitsPerPage: 5000
			})

			// extract the IDs and format those to have pairs of (id, version)
			const ids = searchResults.hits.map(hit => hit.objectID.split("-"))
			const formatted = ids.map(id => `(${id[0]},${id[1]})`)
			// if there are no results, then we return nothing
			if (ids.length === 0) {
				query = query.where("1 = 0")
			}
			// otherwise we filter the results by their (id, version) pair
			else {
				query = query.where(
					`(listing.id, listing.version) IN(${formatted})`
				)
			}
	
			// if the sort option is relevance, we remove the sort arguments as the order
			// of the search results needs to be preserved
			if (sortArgs && sortArgs.relevance) {
				delete sortArgs.relevance
				// if we don't have any results, we don't sort the query as it would
				// create an error
				if (ids.length > 0) {
					// then we manually set the order using array_position
					query = query.addOrderBy(
						`array_position(array[${ids.map(id => `(${id[0]},${id[1]})`)}], (listing.id, listing.version))`
					)
				}
			}
		}
		// in case there is sort by relevance but no search query, it is removed
		// from the sort parameters
		else {
			if (sortArgs && sortArgs.relevance) {
				delete sortArgs.relevance
			}
		}

		// add the sort arguments
		for (const field in sortArgs) {
			query = query.addOrderBy(`listing.${field}`, sortArgs[field])
		}

		// custom filters
		if (filters?.fullyMinted_eq != null || filters?.authorVerified_eq != null
			|| filters?.tokenSupply_lte != null || filters?.tokenSupply_gte != null) {
			// in all cases, we want to join with these 2 tables
			query = query.leftJoin("listing.objkt", "objkt")
			query = query.leftJoin("objkt.issuer", "token")
			// if there is a filter on fully minted issuer
			if (filters?.fullyMinted_eq != null) {
				if (filters.fullyMinted_eq === true) {
					query = query.andWhere("token.balance = 0")
				}
				else {
					query = query.andWhere("token.balance > 0")
				}
			}
			
			// filter for author of the listing verified
			if (filters?.authorVerified_eq != null) {
				query = query.leftJoin("token.author", "author")
				if (filters.authorVerified_eq === true) {
					query = query.andWhere("author.flag = 'VERIFIED'")
				}
				else {
					query = query.andWhere("author.flag != 'VERIFIED'")
				}
			}

			// if we filter the size of the editions
			if (filters?.tokenSupply_lte != null) {
				query = query.andWhere("token.supply <= :sizeLte", { sizeLte: filters.tokenSupply_lte })
			}
			if (filters?.tokenSupply_gte != null) {
				query = query.andWhere("token.supply >= :sizeGte", { sizeGte: filters.tokenSupply_gte })
			}
		}

		// add the where clauses
		const processedFilters = processListingFilters(filters)
		for (const filter of processedFilters) {
			query = query.andWhere(filter)
		}

		// add the pagination
		query = query.offset(skip)
		query = query.limit(take)

		// finally the cache
		// query = query.cache(5000)

		return query.getMany()
	}
	
  @Query(returns => [Listing], {
		nullable: true,
		description: "Given a list of Listing identifiers (ID + contract-version), outputs the associated listings.",
	})
	async listingsByIds(
		@Arg("ids", type => [ListingID]) ids: ListingID[],
		@Arg("sort", { nullable: true }) sortArgs: ListingsSortInput,
	): Promise<Listing[]> {
		const query = Listing.createQueryBuilder("listing")
			.select()
			.where(
				`(listing.id, listing.version) IN(${ids.map(id => `(${id.id},${id.version})`)})`
			)

		return query.getMany()
	}
}