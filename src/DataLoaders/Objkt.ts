import DataLoader from "dataloader"
import { getManager } from "typeorm"
import { Action } from "../Entity/Action"
import { Listing } from "../Entity/Listing"
import { Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { Redemption } from "../Entity/Redemption"
import { Split } from "../Entity/Split"
import { offerQueryFilter } from "../Query/Filters/Offer"
import { ObjktId } from "../Scalar/ObjktId"
import { matchesEntityObjktIdAndIssuerVersion } from "../Utils/Objkt"
import { ETransationType, Transaction } from "../Entity/Transaction"

/**
 * Given a list of objkt IDs, outputs a list of Objkt entities
 */
const batchObjkts = async (ids: readonly ObjktId[]) => {
  const query = Objkt.createQueryBuilder("objkt")
    .select()
    .whereInIds(ids)
    .cache(10000)

  const objkts = await query.getMany()

  return ids.map(({ id, issuerVersion }) =>
    objkts.find(
      objkt => objkt.id === id && objkt.issuerVersion === issuerVersion
    )
  )
}
export const createObjktsLoader = () => new DataLoader(batchObjkts)

/**
 * Given a list of objkt IDs, outputs a list of a list of actions associated
 * to each objkt
 */
const batchObjktActions = async (ids: readonly ObjktId[]) => {
  const actions = await Action.createQueryBuilder("action")
    .select()
    .where(matchesEntityObjktIdAndIssuerVersion(ids, "action"))
    .orderBy("action.createdAt", "DESC")
    .getMany()
  return ids.map(({ id, issuerVersion }: ObjktId) =>
    actions.filter(
      action =>
        action.objktId === id && action.objktIssuerVersion === issuerVersion
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
    .where(matchesEntityObjktIdAndIssuerVersion(ids, "split"))
    .getMany()

  return ids.map(({ id, issuerVersion }: ObjktId) =>
    splits.filter(
      split =>
        split.objktId === id && split.objktIssuerVersion === issuerVersion
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
    .where(matchesEntityObjktIdAndIssuerVersion(ids, "listing"))
    .getMany()

  return ids.map(({ id, issuerVersion }: ObjktId) =>
    listings.filter(
      l => l.objktId === id && l.objktIssuerVersion === issuerVersion
    )
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
    .where(matchesEntityObjktIdAndIssuerVersion(ids, "listing"))
    .andWhere("listing.cancelledAt is null")
    .andWhere("listing.acceptedAt is null")
    .getMany()
  return ids.map(
    ({ id, issuerVersion }: ObjktId) =>
      listings.find(
        l => l.objktId === id && l.objktIssuerVersion === issuerVersion
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
  const ids = inputs.map(({ id, issuerVersion }) => ({ id, issuerVersion }))
  const filters = inputs[0]?.filters
  const sort = inputs[0]?.sort

  const query = Offer.createQueryBuilder("offer")
    .select()
    .where(matchesEntityObjktIdAndIssuerVersion(ids, "offer"))

  // apply filter/sort options
  offerQueryFilter(query, filters, sort)

  const offers = await query.getMany()
  return ids.map(({ id, issuerVersion }: ObjktId) =>
    offers.filter(
      l => l.objktId === id && l.objktIssuerVersion === issuerVersion
    )
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
    .where(matchesEntityObjktIdAndIssuerVersion(ids, "red"))
    .orderBy("red.createdAt", "DESC")
    .getMany()
  return ids.map(({ id, issuerVersion }: ObjktId) =>
    red.filter(r => r.objktId === id && r.objktIssuerVersion === issuerVersion)
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
    .whereInIds(ids)
    .getMany()

  return ids.map(({ id, issuerVersion }: ObjktId) => {
    const objkt = objkts.find(
      o => o.id === id && o.issuerVersion === issuerVersion
    )
    if (!objkt) return []
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
  const transactions = await Transaction.createQueryBuilder("t")
    .select()
    .where(matchesEntityObjktIdAndIssuerVersion(ids, "t"))
    .andWhere({
      type: ETransationType.PRIMARY,
    })
    .getMany()

  return ids.map(
    ({ id, issuerVersion }: ObjktId) =>
      transactions.find(
        action =>
          action.objktId === id && action.objktIssuerVersion === issuerVersion
      )?.price
  )
}
export const createObjktMintedPriceLoader = () =>
  new DataLoader(batchObjktMintedPriceLoader)

/**
 * Given a list of objkt IDs, outputs the last price they were sold for
 */
const batchObjktLastSoldPrice = async ids => {
  /**
   * raw query to get the last transaction for each objkt:
   * - select all transactions that match the objktId and objktIssuerVersion
   * - order by date
   * - select the first (latest) one for each objktId and objktIssuerVersion
   */
  const transactions = await getManager().query(`
    SELECT DISTINCT ON ("objktId", "objktIssuerVersion") "objktId", "objktIssuerVersion", price FROM 
    (
      SELECT * FROM transaction WHERE ${matchesEntityObjktIdAndIssuerVersion(
        ids,
        "transaction"
      )} ORDER BY transaction."createdAt" DESC
    ) as latest_sales_query
  `)

  return ids.map(
    ({ id, issuerVersion }: ObjktId) =>
      transactions.find(
        t => t.objktId === id && t.objktIssuerVersion === issuerVersion
      )?.price
  )
}
export const createObjktLastSoldPriceLoader = () =>
  new DataLoader(batchObjktLastSoldPrice)
