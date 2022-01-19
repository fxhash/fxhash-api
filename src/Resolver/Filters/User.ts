import { SelectQueryBuilder } from "typeorm";
import { searchIndexGenerative } from "../../Services/Search";
import { processUserCollectionFilters } from "../../Utils/Filters";
import { UserCollectionSortInput } from "../Arguments/Sort";

export async function applyUserCollectionFIltersToQuery(
  query: SelectQueryBuilder<any>,
  filters: any,
  sort?: UserCollectionSortInput,
  noJoinAuthor: boolean = false,
): Promise<SelectQueryBuilder<any>> {
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
    if (sort && sort.relevance) {
      // remove the relevance from the object as it's applied here
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
    if (filters.author_in != null || filters.authorVerified_eq != null) {
      // we need the author so we join it (we can select as it's almost always requested)
      if (!noJoinAuthor) {
        query = query.leftJoinAndSelect("issuer.author", "author")
      }
      // filter for a specific author
      if (filters.author_in != null) {
        query = query.andWhere("author.id IN (:...authorId)", { authorId: filters.author_in })
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

  return query
}