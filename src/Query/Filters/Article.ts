import { ArticleSortInput } from "../../Resolver/Arguments/Sort"
import { searchIndexArticles } from "../../Services/Search"
import { processArticleFilters } from "../../Utils/Filters"
import { TQueryFilter } from "./QueryFilter"

type ArticleFilters = Record<string, any>

/**
 * Apply filters & sort options to an article query
 */
export const articleQueryFilter: TQueryFilter<
  ArticleFilters,
  ArticleSortInput
> = async (query, filters, sort) => {
  // if their is a search string, we first make a request to the search engine to get results
  if (filters?.searchQuery_eq) {
    const searchResults = await searchIndexArticles.search(
      filters.searchQuery_eq,
      {
        hitsPerPage: 5000,
      }
    )
    const ids = searchResults.hits.map(hit => hit.objectID)
    query.whereInIds(ids)

    // if the sort option is relevance, we remove the sort arguments as the order
    // of the search results needs to be preserved
    if (sort?.relevance && ids.length > 1) {
      // then we manually set the order using array_position
      const relevanceList = ids.map((id, idx) => `${id}`).join(", ")
      query.addOrderBy(`array_position(array[${relevanceList}], article.id)`)
    }
  }

  // filter for id
  if (filters?.id_in != null) {
    query.andWhereInIds(filters.id_in)
  }

  // delete the relevance sort arg if any at this point
  if (sort?.relevance) {
    delete sort.relevance
  }

  // add the where clauses
  const processedFilters = processArticleFilters(filters)
  for (const filter of processedFilters) {
    query.andWhere(filter)
  }

  // add the sort arguments
  if (sort) {
    for (const field in sort) {
      query.addOrderBy(`article.${field}`, sort[field])
    }
  }

  return query
}
