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

/**
 * Given a list of objkt IDs, outputs a list of Objkt entities
 */
const batchObjkts = async ids => {
  const objkts = await Objkt.find({
    where: {
      id: In(ids),
    },
    // cache: 10000
  })
  return ids.map(id => objkts.find(objkt => objkt.id === id))
}
export const createObjktsLoader = () => new DataLoader(batchObjkts)

/**
 * Given a list of objkt IDs, outputs a list of a list of actions associated
 * to each objkt
 */
const batchObjktActions = async ids => {
  const actions = await Action.createQueryBuilder("action")
    .select()
    .where("action.objktId IN (:...ids)", { ids })
    .orderBy("action.createdAt", "DESC")
    .getMany()
  return ids.map((id: number) =>
    actions.filter(action => action.objktId === id)
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
    .where("split.objktId IN(:...ids)", { ids })
    .getMany()
  return ids.map(id => splits.filter(split => split.objktId === id))
}
export const createObjktRoyaltiesSplitsLoader = () =>
  new DataLoader(batchObjktRoyaltiesSplits)

/**
 * Given a list of objkt IDs, returns a list of listings
 */
const batchObjktListings = async (ids: any) => {
  const listings = await Listing.createQueryBuilder("listing")
    .select()
    .where("listing.objktId IN(:...ids)", { ids })
    .getMany()

  return ids.map(id => listings.filter(l => l.objktId === id))
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
    .where("listing.objktId IN(:...ids)", { ids })
    .andWhere("listing.cancelledAt is null")
    .andWhere("listing.acceptedAt is null")
    .getMany()
  return ids.map(id => listings.find(l => l.objktId === id) || null)
}
export const createObjktActiveListingsLoader = () =>
  new DataLoader(batchObjktActiveListings)

/**
 * Given a list of objkt IDs, returns a list of offers
 */
const batchObjktOffers = async (inputs: any) => {
  // we extract the ids and the filters if any
  const ids = inputs.map(input => input.id)
  const filters = inputs[0]?.filters
  const sort = inputs[0]?.sort

  const query = Offer.createQueryBuilder("offer")
    .select()
    .where("offer.objktId IN(:...ids)", { ids })

  // apply filter/sort options
  offerQueryFilter(query, filters, sort)

  const offers = await query.getMany()
  return ids.map(id => offers.filter(l => l.objktId === id))
}
export const createObjktOffersLoader = () => new DataLoader(batchObjktOffers)

/**
 * Given a list of objkt IDs, outputs a list of a list of redemptions associated
 * to each objkt
 */
const batchObjktRedemptions = async ids => {
  const red = await Redemption.createQueryBuilder("red")
    .select()
    .where("red.objktId IN (:...ids)", { ids })
    .orderBy("red.createdAt", "DESC")
    .getMany()
  return ids.map((id: number) => red.filter(r => r.objktId === id))
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
    .where("O.id IN (:...ids)", { ids })
    .getMany()

  return ids.map((id: number) => {
    const objkt = objkts.find(o => o.id === id)
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
    .select(['a.id', 'a.objktId', 'a.type', 'a.numericValue'])
    .addSelect('min("createdAt")', 'createdAt')
    .where("a.objktId IN (:...ids)", { ids })
    .andWhere("a.type = 'MINTED_FROM'")
    .groupBy('a.id')
    .addGroupBy('a."objktId"')
    .getMany()

  return ids.map((id: number) =>
    actions.find(action => action.objktId === id)?.numericValue
  )
}
export const createObjktMintedPriceLoader = () => new DataLoader(batchObjktMintedPriceLoader)
