import { Brackets, LessThanOrEqual, MoreThan } from "typeorm"
import { GentkTokPricing } from "../../Entity/GenerativeToken"
import { GenerativeSortInput } from "../../Resolver/Arguments/Sort"
import { searchIndexGenerative } from "../../Services/Search"
import { processGenerativeFilters } from "../../Utils/Filters"
import { TQueryFilter } from "./QueryFilter"


type GenerativeTokenFilters = Record<string, any>

/**
 * Apllies filters and sort arguments to a query
 */
export const generativeQueryFilter: TQueryFilter<
  GenerativeTokenFilters, GenerativeSortInput
> = async (
  query,
  filters,
  baseSort,
) => {
  const sort = {...baseSort}
  // if their is a search string, we first make a request to the search engine to get results
  if (filters?.searchQuery_eq) {
    const searchResults = await searchIndexGenerative.search(filters.searchQuery_eq, {
      hitsPerPage: 5000
    })
    const ids = searchResults.hits.map(hit => hit.objectID)
    query.whereInIds(ids)

    // if the sort option is relevance, we remove the sort arguments as the order
    // of the search results needs to be preserved
    if (sort?.relevance && ids.length > 1) {
      // then we manually set the order using array_position
      const relevanceList = ids.map((id, idx) => `${id}`).join(', ')
      query.addOrderBy(`array_position(array[${relevanceList}], token.id)`)
    }
  }

  // delete the relevance sort arg if any at this point
  if (sort?.relevance) {
    delete sort.relevance
  }

  // CUSTOM FILTERS

  // filter for the field author verified
  if (filters?.authorVerified_eq != null) {
    query.leftJoin("token.author", "author")
    if (filters.authorVerified_eq === true) {
      query.andWhere("author.flag = 'VERIFIED'")
    }
    else {
      query.andWhere("author.flag != 'VERIFIED'")
    }
  }

  // add filter for the locked / unlocked tokens
  if (filters?.locked_eq != null) {
    // filter the unlocked tokens
    if (filters.locked_eq === false) {
      query.andWhere({
        lockEnd: LessThanOrEqual(new Date())
      })
    }
    // filter only the locked tokens
    else if (filters.locked_eq === true) {
      query.andWhere({
        lockEnd: MoreThan(new Date())
      })
    }
  }

  // add filter for the locked / unlocked tokens
  if (filters?.locked_eq != null) {
    // filter the unlocked tokens
    if (filters.locked_eq === false) {
      query.andWhere({
        lockEnd: LessThanOrEqual(new Date())
      })
    }
    // filter only the locked tokens
    else if (filters.locked_eq === true) {
      query.andWhere({
        lockEnd: MoreThan(new Date())
      })
    }
  }

  // add filter for the mint available
  if (filters?.mintOpened_eq != null) {
    // filter the unlocked tokens
    if (filters.mintOpened_eq === false) {
      query.andWhere({
        mintOpensAt: MoreThan(new Date()),
      })
    }
    // filter only the locked tokens
    else if (filters.mintOpened_eq === true) {
      query.andWhere({
        mintOpensAt: LessThanOrEqual(new Date()),
      })
    }
  }

  // filter for the field mint progress
  if (filters?.mintProgress_eq != null) {
    // if we want to filter all completed collections
    if (filters.mintProgress_eq === "COMPLETED") {
      query.andWhere("token.balance = 0")
    }
    // if we want to filter all the ongoing collections
    else if (filters.mintProgress_eq === "ONGOING") {
      query.andWhere("token.balance > 0")
    }
    // if we want to filter all the collections close to be finished
    else if (filters.mintProgress_eq === "ALMOST") {
      query.andWhere("token.balance::decimal / token.supply < 0.1 AND token.balance > 0")
    }
  }

  // we add the join based on the existence of certain sort / filter
  if (filters?.price_gte || filters?.price_lte || sort?.price
    || filters?.pricingMethod_eq) {
    // we inner join if a filter on pricing method is done
    if (filters?.pricingMethod_eq === GentkTokPricing.FIXED) {
      query.innerJoinAndSelect("token.pricingFixed", "pricingFixed")
    }
    else {
      query.leftJoinAndSelect("token.pricingFixed", "pricingFixed")
    }
    // we inner join if a filter on pricing method is done
    if (filters?.pricingMethod_eq === GentkTokPricing.DUTCH_AUCTION) {
      query.innerJoinAndSelect("token.pricingDutchAuction", "pricingDutchAuction")
    }
    else {
      query.leftJoinAndSelect("token.pricingDutchAuction", "pricingDutchAuction")
    }
  }

  // process the filters on the prices
  if (filters?.price_gte) {
    query.andWhere(new Brackets(qb => {
      qb.where("pricingFixed.price >= :price_gte", {
          price_gte: filters.price_gte
        })
        .orWhere("pricingDutchAuction.restingPrice >= :price_gte", {
          price_gte: filters.price_gte
        })
    }))
  }
  if (filters?.price_lte) {
    query.andWhere(new Brackets(qb => {
      qb.where("pricingFixed.price <= :price_lte", {
          price_lte: filters.price_lte
        })
        .orWhere("pricingDutchAuction.restingPrice <= :price_lte", {
          price_lte: filters.price_lte
        })
    }))
  }

  // add the where clauses
  const processedFilters = processGenerativeFilters(filters)
  for (const filter of processedFilters) {
    query.andWhere(filter)
  }

  // add the sort arguments
  if (sort) {
    for (const field in sort) {
      // since price is defined in different tables, we need to craft a generic
      // query to sort all the items in an elegant fashion
      // TODO: support dutch auctions
      if (field === "price") {
        query.addOrderBy(
          "pricingFixed.price",
          sort[field],
          "NULLS LAST"
        )
      }
      else {
        query.addOrderBy(`token.${field}`, sort[field])
      }
    }
  }

  return query
}
