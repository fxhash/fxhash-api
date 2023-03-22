import { searchIndexUser } from "../../Services/Search"
import { TQueryFilter } from "./QueryFilter"


type UserFilters = Record<string, any>

/**
 * Apllies filters and sort arguments to a query
 */
export const userQueryFilter: TQueryFilter<
  UserFilters, any
> = async (
  query,
  filters,
  sort,
) => {
  // if their is a search string, we first make a request to the search engine to get results
  if (filters?.searchQuery_eq) {
    const searchResults = await searchIndexUser.search(filters.searchQuery_eq, { 
      hitsPerPage: 5000
    })
    const ids = searchResults.hits.map(hit => hit.objectID)
    query.whereInIds(ids)

    // if the sort option is relevance, we remove the sort arguments as the order
    // of the search results needs to be preserved
    if (sort?.relevance && ids.length > 1) {
      // then we manually set the order using array_position
      const relevanceList = ids.map((id, idx) => `'${id}'`).join(', ')
      query.addOrderBy(`array_position(ARRAY[${relevanceList}]::varchar[], user.id)`)
    }
  }

  // delete the relevance sort arg if any at this point
  if (sort?.relevance) {
    delete sort.relevance
  }

  return query
}