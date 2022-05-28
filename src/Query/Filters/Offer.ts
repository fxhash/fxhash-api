import { Brackets } from "typeorm"
import { OffersSortInput } from "../../Resolver/Arguments/Sort"
import { TQueryFilter } from "./QueryFilter"


type OfferFilters = Record<string, any>

/**
 * Apllies filters and sort arguments to a query
 */
export const offerQueryFilter: TQueryFilter<
  OfferFilters, OffersSortInput
> = async (
  query,
  filters,
  sort,
) => {
  // apply filters, if any
	if (filters) {
		if (filters.active_eq === true) {
			query.andWhere("offer.cancelledAt is null")
			query.andWhere("offer.acceptedAt is null")
		}
		else if (filters.active_eq === false) {
			query.andWhere(new Brackets(qb => {
				qb.where("offer.cancelledAt is not null")
				qb.orWhere("offer.acceptedAt is not null")
			}))
		}
	}

  // add the sort arguments
  if (sort) {
    for (const field in sort) {
      query.addOrderBy(`offer.${field}`, sort[field])
    }
  }

  return query
}