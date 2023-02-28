import DataLoader from "dataloader"
import { Brackets, In } from "typeorm"
import { Action } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Listing } from "../Entity/Listing"
import { Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { Redeemable } from "../Entity/Redeemable"
import { Redemption } from "../Entity/Redemption"
import { Split } from "../Entity/Split"
import { offerQueryFilter } from "../Query/Filters/Offer"
import { TokenId } from "../Scalar/TokenId"
import { matchesEntityTokenIdAndVersion } from "../Utils/GenerativeToken"

const tokenIdToObjktId = (tokenId: TokenId) => ({
  id: tokenId.id,
  issuerVersion: tokenId.version,
})

const matchesEntityObjktIdAndVersion = (ids: TokenId[], entity: string) =>
  matchesEntityTokenIdAndVersion(ids, entity, "objkt", "objktIssuer")

/**
 * Given a list of objkt IDs, outputs a list of Objkt entities
 */
const batchObjkts = async ids => {
  const query = Objkt.createQueryBuilder("objkt")
    .select()
    .whereInIds(ids.map(tokenIdToObjktId))
    .cache(10000)

  const objkts = await query.getMany()

  return ids.map(({ id, version }) =>
    objkts.find(objkt => objkt.id === id && objkt.issuerVersion === version)
  )
}
export const createObjktsLoader = () => new DataLoader(batchObjkts)

/**
 * Given a list of objkt IDs, outputs a list of a list of actions associated
 * to each objkt
 */
const batchObjktActions = async ids => {
  const actions = await Action.createQueryBuilder("action")
    .select()
    .where(matchesEntityObjktIdAndVersion(ids, "action"))
    .orderBy("action.createdAt", "DESC")
    .getMany()
  return ids.map(({ id, version }: TokenId) =>
    actions.filter(
      action => action.objktId === id && action.objktIssuerVersion === version
    )
  )
}
export const createObjktActionsLoader = () => new DataLoader(batchObjktActions)

/**
 * Given a list of Generative Token IDs, outputs their splits on the
 * **primary** market.
 */
const batchObjktRoyaltiesSplits = async ids => {
  const splits = await Split.createQueryBuilder("split")
    .select()
    .where(matchesEntityObjktIdAndVersion(ids, "split"))
    .getMany()

  return ids.map(({ id, version }: TokenId) =>
    splits.filter(
      split => split.objktId === id && split.objktIssuerVersion === version
    )
  )
}
export const createObjktRoyaltiesSplitsLoader = () =>
  new DataLoader(batchObjktRoyaltiesSplits)

/**
 * Given a list of objkt IDs, returns a list of listings
 */
const batchObjktListings = async (ids: any) => {
  const listings = await Listing.createQueryBuilder("listing")
    .select()
    .where(matchesEntityObjktIdAndVersion(ids, "listing"))
    .getMany()

  return ids.map(({ id, version }: TokenId) =>
    listings.filter(l => l.objktId === id && l.objktIssuerVersion === version)
  )
}
export const createObjktListingsLoader = () =>
  new DataLoader(batchObjktListings)

/**
 * Given a list of objkt IDs, returns a list of active listings for each objkt.
 * The list can contain NULL elements if the objkt doesn't have an active
 * listing.
 */
const batchObjktActiveListings = async (ids: any) => {
  const listings = await Listing.createQueryBuilder("listing")
    .select()
    .where(matchesEntityObjktIdAndVersion(ids, "listing"))
    .andWhere("listing.cancelledAt is null")
    .andWhere("listing.acceptedAt is null")
    .getMany()
  return ids.map(
    ({ id, version }: TokenId) =>
      listings.find(
        l => l.objktId === id && l.objktIssuerVersion === version
      ) || null
  )
}
export const createObjktActiveListingsLoader = () =>
  new DataLoader(batchObjktActiveListings)

/**
 * Given a list of objkt IDs, returns a list of offers
 */
const batchObjktOffers = async (inputs: any) => {
  // we extract the ids and the filters if any
  const ids = inputs.map(({ id, version }) => ({ id, version }))
  const filters = inputs[0]?.filters
  const sort = inputs[0]?.sort

  const query = Offer.createQueryBuilder("offer")
    .select()
    .where(matchesEntityObjktIdAndVersion(ids, "offer"))

  // apply filter/sort options
  offerQueryFilter(query, filters, sort)

  const offers = await query.getMany()
  return ids.map(({ id, version }: TokenId) =>
    offers.filter(l => l.objktId === id && l.objktIssuerVersion === version)
  )
}
export const createObjktOffersLoader = () => new DataLoader(batchObjktOffers)

/**
 * Given a list of objkt IDs, outputs a list of a list of redemptions associated
 * to each objkt
 */
const batchObjktRedemptions = async ids => {
  const red = await Redemption.createQueryBuilder("red")
    .select()
    .where(matchesEntityObjktIdAndVersion(ids, "red"))
    .orderBy("red.createdAt", "DESC")
    .getMany()
  return ids.map(({ id, version }: TokenId) =>
    red.filter(r => r.objktId === id && r.objktIssuerVersion === version)
  )
}
export const createObjktRedemptionsLoader = () =>
  new DataLoader(batchObjktRedemptions)

/**
 * Given a list of objkt IDs, outputs a list of a list of available redeemables
 * for each objkt. A redeemable is available if this objkt has not been
 * redeemed more than the redeemable max consumption.
 */
const batchObjktAvailableRedeemables = async ids => {
  // select the redeemables associated with the objkts
  const objkts = await Objkt.createQueryBuilder("O")
    .leftJoinAndSelect("O.issuer", "G")
    .leftJoinAndSelect("G.redeemables", "Ra")
    .leftJoinAndSelect("O.redemptions", "Re")
    .where(matchesEntityObjktIdAndVersion(ids, "O"))
    .getMany()

  return ids.map(({ id, version }: TokenId) => {
    const objkt = objkts.find(o => o.id === id && o.issuerVersion === version)
    if (!objkt) return null
    return objkt.issuer!.redeemables.filter(
      redeemable =>
        objkt.redemptions.filter(
          r => r.redeemableAddress === redeemable.address
        ).length < redeemable.maxConsumptionsPerToken
    )
  })
}
export const createObjktAvailableRedeemablesLoader = () =>
  new DataLoader(batchObjktAvailableRedeemables)

/**
 * Given a list of objkt IDs, outputs their minted price
 */
const batchObjktMintedPriceLoader = async ids => {
  const actions = await Action.createQueryBuilder("a")
    .select([
      "a.id",
      "a.objktId",
      "a.objktIssuerVersion",
      "a.type",
      "a.numericValue",
    ])
    .addSelect('min("createdAt")', "createdAt")
    .where(matchesEntityObjktIdAndVersion(ids, "a"))
    .andWhere("a.type = 'MINTED_FROM'")
    .groupBy("a.id")
    .addGroupBy('a."objktId"')
    .getMany()

  return ids.map(
    ({ id, version }: TokenId) =>
      actions.find(
        action => action.objktId === id && action.objktIssuerVersion === version
      )?.numericValue
  )
}
export const createObjktMintedPriceLoader = () =>
  new DataLoader(batchObjktMintedPriceLoader)
