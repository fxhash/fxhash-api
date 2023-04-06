import { Brackets } from "typeorm"
import { OffersSortInput } from "../../Resolver/Arguments/Sort"
import { TQueryFilter } from "./QueryFilter"
import { AnyOffer, offerTypeGuard } from "../../types/AnyOffer"
import { sortByProperty } from "../../Utils/Sort"

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
        if (field === "floorDifference") {
          // use fd_ as a prefix to avoid conflicts with existing table aliases
          if (table === "offer") {
            query.leftJoinAndSelect("offer.objkt", "fd_objkt")
            query.leftJoinAndSelect("fd_objkt.issuer", "fd_token")
            query.leftJoinAndSelect("fd_token.marketStats", "fd_stats")
            query.addSelect(
              "(offer.price / fd_stats.floor) * 100",
              "floorDifference"
            )
            query.addOrderBy(`"floorDifference"`, sort[field])
          } else {
            query.leftJoinAndSelect("collection_offer.token", "fd_token")
            query.leftJoinAndSelect("fd_token.marketStats", "fd_stats")
            query.addOrderBy(
              `(collection_offer.price / fd_stats.floor) * 100`,
              sort[field]
            )
          }
          continue
        }
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

export const sortOffersAndCollectionOffers = (
  offersA: AnyOffer[],
  offersB: AnyOffer[],
  sort: OffersSortInput
) => {
  const sortProperty = Object.keys(sort)[0]
  const sortDirection = sort[sortProperty]

  // workaround for the floorDifference computed column
  if (sortProperty === "floorDifference") {
    return [...offersA, ...offersB].sort((a, b) => {
      const aFloor =
        (offerTypeGuard(a)
          ? a.objkt.issuer?.marketStats.floor
          : a.token.marketStats.floor) || 0
      const bFloor =
        (offerTypeGuard(b)
          ? b.objkt.issuer?.marketStats.floor
          : b.token.marketStats.floor) || 0

      const aFloorDifference = (a.price / aFloor) * 100
      const bFloorDifference = (b.price / bFloor) * 100

      const displayA = offerTypeGuard(a) ? a.objkt.name : a.token.name
      const displayB = offerTypeGuard(b) ? b.objkt.name : b.token.name

      return sortDirection === "ASC"
        ? aFloorDifference - bFloorDifference
        : bFloorDifference - aFloorDifference
    })
  }

  // sort the results
  return [...offersA, ...offersB].sort(
    sortByProperty(sortProperty, sortDirection)
  )
}
