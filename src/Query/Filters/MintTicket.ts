import { MintTicketSortInput } from "../../Resolver/Arguments/Sort"
import { processMintTicketFilters } from "../../Utils/Filters"
import { TQueryFilter } from "./QueryFilter"

type MintTicketFilters = Record<string, any>

/**
 * Applies filters and sort arguments to a mint ticket query
 */
export const mintTicketQueryFilter: TQueryFilter<
  MintTicketFilters,
  MintTicketSortInput
> = async (query, filters, sort) => {
  // process the filters directly against the objkt table
  const processedFilters = processMintTicketFilters(filters)
  for (const filter of processedFilters) {
    query.andWhere(filter)
  }

  if (filters?.owner_eq) {
    query.andWhere(`mintTicket.ownerId = :ownerId`, {
      ownerId: filters.owner_eq,
    })
  }

  // add the sort arguments
  if (sort) {
    for (const field in sort) {
      query.addOrderBy(`mintTicket.${field}`, sort[field])
    }
  }

  return query
}
