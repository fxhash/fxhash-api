import { Brackets } from "typeorm"
import { OffersSortInput } from "../../Resolver/Arguments/Sort"
import { TQueryFilter } from "./QueryFilter"

type OfferFilters = Record<string, any>

const anyOfferQueryFilter =
  (
    table: "offer" | "collection_offer"
  ): TQueryFilter<OfferFilters, OffersSortInput> =>
  async (query, filters, sort) => {
    const fulfilledField =
      table === "collection_offer" ? "completedAt" : "acceptedAt"

    // apply filters, if any
    if (filters) {
      if (filters.active_eq === true) {
        query.andWhere(`${table}.cancelledAt is null`)
        query.andWhere(`${table}.${fulfilledField} is null`)
      } else if (filters.active_eq === false) {
        query.andWhere(
          new Brackets(qb => {
            qb.where(`${table}.cancelledAt is not null`)
            qb.orWhere(`${table}.${fulfilledField} is not null`)
          })
        )
      }
    }

    // add the sort arguments
    if (sort) {
      for (const field in sort) {
        query.addOrderBy(`${table}.${field}`, sort[field])
      }
    }

    return query
  }

/**
 * Apllies filters and sort arguments to a query
 */
export const offerQueryFilter: TQueryFilter<OfferFilters, OffersSortInput> =
  anyOfferQueryFilter("offer")

export const collectionOfferQueryFilter: TQueryFilter<
  OfferFilters,
  OffersSortInput
> = anyOfferQueryFilter("collection_offer")
