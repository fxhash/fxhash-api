import { LessThan, MoreThanOrEqual } from "typeorm"
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

  if (filters?.owner_ne) {
    query.andWhere(`mintTicket.ownerId != :ownerId`, {
      ownerId: filters.owner_ne,
    })
  }

  if (filters?.token_eq) {
    query.andWhere(`mintTicket.tokenId = :tokenId`, {
      tokenId: filters.token_eq,
    })
  }

  // add filter for the grace period
  if (filters?.inGracePeriod_eq != null) {
    // filter the tickets outside of the grace period
    if (filters.inGracePeriod_eq === false) {
      query.andWhere({
        taxationStart: LessThan(new Date()),
      })
    }
    // filter only the tickets in the grace period
    else if (filters.mintOpened_eq === true) {
      query.andWhere({
        taxationStart: MoreThanOrEqual(new Date()),
      })
    }
  }

  // add filter for under auction
  if (filters?.underAuction_eq != null) {
    // filter the tickets not under auction
    if (filters.underAuction_eq === false) {
      query.andWhere({
        taxationPaidUntil: MoreThanOrEqual(new Date()),
      })
    }
    // filter only the tickets under auction
    else if (filters.underAuction_eq === true) {
      query.andWhere({
        taxationPaidUntil: LessThan(new Date()),
      })
    }
  }

  // add the sort arguments
  if (sort) {
    for (const field in sort) {
      query.addOrderBy(`mintTicket.${field}`, sort[field])
    }
  }

  return query
}
