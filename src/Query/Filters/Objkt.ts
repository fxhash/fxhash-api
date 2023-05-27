import { Brackets } from "typeorm"
import { ObjktsSortInput } from "../../Resolver/Arguments/Sort"
import { searchIndexGenerative } from "../../Services/Search"
import {
  processGentkFeatureFilters,
  processObjktFilters,
} from "../../Utils/Filters"
import { TQueryFilter } from "./QueryFilter"

interface ObjktFilters {
  general?: Record<string, any>
  featureFilters?: any[]
}

/**
 * Apllies filters and sort arguments to a query
 * ! **Requires the passed query to have available "issuer" join**
 */
export const objktQueryFilter: TQueryFilter<
  ObjktFilters,
  ObjktsSortInput
> = async (query, filtersObj, sort) => {
  // extract
  const { featureFilters, general: filters } = filtersObj

  // if we have some filters on the features
  if (featureFilters && featureFilters.length > 0) {
    const processed = processGentkFeatureFilters(featureFilters)
    // filtering features is a little bit tricky, because we have to group
    // where operations in a specific way. Let's say that we have 2 features:
    // - A [a, b, c, d]
    // - B [a, b, c, d]
    // If we want to select Aa and Ab, we want all the gentks where A is a OR b
    // If we want to select Ba and Bb, we want all the gentks where B is a OR b
    // If we want to select Aa and Ba, we want all the gentks where A is a AND B is b
    // so we need to query each single feature values in a OR and each different feature in AND
    for (let i = 0; i < processed.length; i++) {
      const filterGroup = processed[i]
      query.andWhere(
        new Brackets(qb => {
          for (let j = 0; j < filterGroup.length; j++) {
            const filter = filterGroup[j]
            qb.orWhere(`objkt.features::jsonb @> :filter_${i}_${j}`, {
              [`filter_${i}_${j}`]: filter,
            })
          }
        })
      )
    }
  }

  // if the filters says "OFFER NOT NULL", we can use inner join to filter query
  if (filters && filters.activeListing_exist === true) {
    query.innerJoinAndSelect(
      "objkt.listings",
      "listing",
      "listing.acceptedAt is null AND listing.cancelledAt is null"
    )
  }
  // also add a join if a sort by listing is requested
  else if (sort && (sort.listingPrice || sort.listingCreatedAt)) {
    query.leftJoinAndSelect(
      "objkt.listings",
      "listing",
      "listing.acceptedAt is null AND listing.cancelledAt is null"
    )
  }

  // if their is a search string, we leverage the fact that gentks can be searched
  // using the Generative Token index, because they are all children of it
  if (filters?.searchQuery_eq) {
    const searchResults = await searchIndexGenerative.search(
      filters.searchQuery_eq,
      {
        hitsPerPage: 5000,
      }
    )
    const ids = searchResults.hits.map(hit => hit.objectID)
    query.andWhere("issuer.id IN (:...issuerIds)", { issuerIds: ids })

    // if the sort option is relevance, we remove the sort arguments as the order
    // of the search results needs to be preserved
    if (sort && sort.relevance) {
      // remove the relevance from the object as it's applied here
      delete sort.relevance
      if (ids.length > 0) {
        // then we manually set the order using array_position
        const relevanceList = ids.map((id, idx) => `${id}`).join(", ")
        query.addOrderBy(`array_position(array[${relevanceList}], objkt.id)`)
      }
    }
  }

  // process the filters directly against the objkt table
  const processedFilters = processObjktFilters(filters)
  for (const filter of processedFilters) {
    query.andWhere(filter)
  }

  // custom filters
  if (filters) {
    // filter for id
    if (filters?.id_in != null) {
      query.andWhereInIds(filters.id_in)
    }

    // all the filters related to the author
    if (filters.author_in != null || filters.authorVerified_eq != null) {
      // we need the author so we join it (can select, almost always requested)
      query.leftJoinAndSelect("issuer.author", "author")
      // filter for a specific author
      if (filters.author_in != null) {
        query.andWhere("author.id IN (:...authorId)", {
          authorId: filters.author_in,
        })
      }
      // filters for verified authors only
      if (filters.authorVerified_eq != null) {
        if (filters.authorVerified_eq === true) {
          query.andWhere("author.flag = 'VERIFIED'")
        } else {
          query.andWhere("author.flag != 'VERIFIED'")
        }
      }
    }

    // the mint progress
    if (filters.mintProgress_eq != null) {
      // if we want to filter all completed collections
      if (filters.mintProgress_eq === "COMPLETED") {
        query.andWhere("issuer.balance = 0")
      }
      // if we want to filter all the ongoing collections
      else if (filters.mintProgress_eq === "ONGOING") {
        query.andWhere("issuer.balance > 0")
      }
      // if we want to filter all the collections close to be finished
      else if (filters.mintProgress_eq === "ALMOST") {
        query.andWhere(
          "issuer.balance::decimal / issuer.supply < 0.1 AND issuer.balance > 0"
        )
      }
    }

    // add filter for redeemable objkts
    if (filters?.redeemable_eq != null) {
      // filter the redeemable objkts without redemptions
      if (filters.redeemable_eq === true) {
        query
          .innerJoin("redeemable", "r", "r.tokenId = issuer.id")
          .leftJoin(
            "redemption",
            "red",
            "r.address = red.redeemableAddress AND red.objktId = objkt.id AND red.objktIssuerVersion = objkt.issuerVersion"
          )
          .andWhere("red.id IS NULL")
      }
      // filter the objkts without redeemables
      else if (filters.redeemable_eq === false) {
        query
          .leftJoin("redeemable", "r", "r.tokenId = issuer.id")
          .where("r.tokenId IS NULL")
      }
    }

    // add filter for redeemed objkts
    if (filters?.redeemed_eq != null) {
      query
        .innerJoin("redeemable", "r", "r.tokenId = issuer.id")
        .leftJoin(
          "redemption",
          "red",
          "r.address = red.redeemableAddress AND red.objktId = objkt.id AND red.objktIssuerVersion = objkt.issuerVersion"
        )

      // filter the objkts with redemptions
      if (filters.redeemed_eq === true) query.andWhere("red.id IS NOT NULL")
      // filter the redeemable objkts without redemptions
      else if (filters.redeemed_eq === false) query.andWhere("red.id IS NULL")
    }

    // filter for some issuers only
    if (filters.issuer_in != null) {
      query.andWhere("issuer.id IN (:...issuerIdFilters)", {
        issuerIdFilters: filters.issuer_in,
      })
    }

    // if we only want the items with an offer
    if (filters.offer_ne === null) {
      query.innerJoinAndSelect("objkt.offer", "offer")
    }
  }

  // SORTING

  if (sort) {
    for (const sortEntry in sort) {
      if (sortEntry === "listingPrice") {
        query.addOrderBy("listing.price", sort[sortEntry], "NULLS LAST")
      } else if (sortEntry === "listingCreatedAt") {
        query.addOrderBy("listing.createdAt", sort[sortEntry], "NULLS LAST")
      } else if (sortEntry === "collectedAt") {
        query.leftJoin(
          "objkt.actions",
          "action",
          "action.objktId = objkt.id AND action.type = 'OFFER_ACCEPTED'"
        )
        query.addOrderBy("action.createdAt", sort[sortEntry], "NULLS LAST")
      } else {
        query.addOrderBy(`objkt.${sortEntry}`, sort[sortEntry], "NULLS LAST")
      }
    }
    /**
     * finally, sort by id to preserve the order of the search results:
     * https://github.com/fxhash/fxhash-api/issues/36
     */
    query.addOrderBy("objkt.id", "ASC")
  }

  return query
}
