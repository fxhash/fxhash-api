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
  GenerativeTokenFilters,
  GenerativeSortInput
> = async (query, filters, sort) => {
  // if their is a search string, we first make a request to the search engine to get results
  if (filters?.searchQuery_eq) {
    const searchResults = await searchIndexGenerative.search(
      filters.searchQuery_eq,
      {
        hitsPerPage: 5000,
      }
    )
    // extract the IDs and format those to have pairs of (id, version)
    const ids = searchResults.hits.map(hit => {
      const [id, version] = hit.objectID.split("-")
      return { id, version }
    })
    query.whereInIds(ids)

    // if the sort option is relevance, we remove the sort arguments as the order
    // of the search results needs to be preserved
    if (sort?.relevance && ids.length > 1) {
      // then we manually set the order using array_position
      const relevanceList = ids.map((id, idx) => `${id.id}`).join(", ")
      query.addOrderBy(`array_position(array[${relevanceList}], token.id)`)
    }
  }

  // delete the relevance sort arg if any at this point
  if (sort?.relevance) {
    delete sort.relevance
  }

  // CUSTOM FILTERS

  // filter for id/version
  if (filters?.id_in != null) {
    query.andWhereInIds(filters.id_in)
  }

  // filter for the field author verified
  if (filters?.authorVerified_eq != null) {
    query.leftJoin("token.author", "author")
    if (filters.authorVerified_eq === true) {
      query.andWhere("author.flag = 'VERIFIED'")
    } else {
      query.andWhere("author.flag != 'VERIFIED'")
    }
  }

  // add filter for the locked / unlocked tokens
  if (filters?.locked_eq != null) {
    // filter the unlocked tokens
    if (filters.locked_eq === false) {
      query.andWhere({
        lockEnd: LessThanOrEqual(new Date()),
      })
    }
    // filter only the locked tokens
    else if (filters.locked_eq === true) {
      query.andWhere({
        lockEnd: MoreThan(new Date()),
      })
    }
  }

  // add filter for the locked / unlocked tokens
  if (filters?.locked_eq != null) {
    // filter the unlocked tokens
    if (filters.locked_eq === false) {
      query.andWhere({
        lockEnd: LessThanOrEqual(new Date()),
      })
    }
    // filter only the locked tokens
    else if (filters.locked_eq === true) {
      query.andWhere({
        lockEnd: MoreThan(new Date()),
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

  // add filter for fxparams projects
  if (filters?.fxparams_eq != null) {
    // filter the tokens with params
    if (filters.fxparams_eq === true) {
      query.andWhere({
        inputBytesSize: MoreThan(0),
      })
    }
    // filter the tokens without params
    else if (filters.fxparams_eq === false) {
      query.andWhere({
        inputBytesSize: 0,
      })
    }
  }

  // add filter for redeemable projects
  if (filters?.redeemable_eq != null) {
    // filter the tokens with redeemables
    if (filters.redeemable_eq === true) {
      query.where(
        'EXISTS (SELECT 1 FROM redeemable WHERE redeemable."tokenId" = token.id)'
      )
    }
    // filter the tokens without redeemables
    else if (filters.redeemable_eq === false) {
      query.where(
        'NOT EXISTS (SELECT 1 FROM redeemable WHERE redeemable."tokenId" = token.id)'
      )
    }
  }

  // add filter for labels
  if (filters?.labels_in != null) {
    query.andWhere(
      `token.labels @> ARRAY['{${filters.labels_in.join(", ")}}'::smallint[]]`
    )
  }

  // filter for the field mint progress
  if (filters?.mintProgress_eq != null) {
    // if we want to filter all completed collections
    if (filters.mintProgress_eq === "COMPLETED") {
      query.andWhere("token.balance = 0")
    }
    // if we want to filter all the ongoing collections
    else if (filters.mintProgress_eq === "ONGOING") {
      query.leftJoin("token.reserves", "reserves")
      query.andWhere("token.balance > 0")
      query.groupBy("token.id")
      query.having("token.balance - COALESCE(SUM(reserves.amount), 0) > 0")
    }
    // if we want to filter all the collections close to be finished
    else if (filters.mintProgress_eq === "ALMOST") {
      query.leftJoin("token.reserves", "reserves")
      query.andWhere(
        "token.balance::decimal / token.supply < 0.1 AND token.balance > 0"
      )
      query.groupBy("token.id")
      query.having("token.balance - COALESCE(SUM(reserves.amount), 0) > 0")
    }
  }

  // we add the join based on the existence of certain sort / filter
  if (
    filters?.price_gte ||
    filters?.price_lte ||
    sort?.price ||
    filters?.pricingMethod_eq
  ) {
    // we inner join if a filter on pricing method is done
    if (filters?.pricingMethod_eq === GentkTokPricing.FIXED) {
      query.innerJoinAndSelect("token.pricingFixed", "pricingFixed")
    } else {
      query.leftJoinAndSelect("token.pricingFixed", "pricingFixed")
    }
    // we inner join if a filter on pricing method is done
    if (filters?.pricingMethod_eq === GentkTokPricing.DUTCH_AUCTION) {
      query.innerJoinAndSelect(
        "token.pricingDutchAuction",
        "pricingDutchAuction"
      )
    } else {
      query.leftJoinAndSelect(
        "token.pricingDutchAuction",
        "pricingDutchAuction"
      )
    }
  }

  // process the filters on the prices
  if (filters?.price_gte) {
    query.andWhere(
      new Brackets(qb => {
        qb.where("pricingFixed.price >= :price_gte", {
          price_gte: filters.price_gte,
        }).orWhere("pricingDutchAuction.restingPrice >= :price_gte", {
          price_gte: filters.price_gte,
        })
      })
    )
  }
  if (filters?.price_lte) {
    query.andWhere(
      new Brackets(qb => {
        qb.where("pricingFixed.price <= :price_lte", {
          price_lte: filters.price_lte,
        }).orWhere("pricingDutchAuction.restingPrice <= :price_lte", {
          price_lte: filters.price_lte,
        })
      })
    )
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
        query.addOrderBy("pricingFixed.price", sort[field], "NULLS LAST")
      } else {
        query.addOrderBy(`token.${field}`, sort[field])
      }
    }
    /**
     * finally, sort by id to preserve the order of the search results:
     * https://github.com/fxhash/fxhash-api/issues/36
     */
    query.addOrderBy("token.id", "ASC")
  }

  return query
}
