import DataLoader from "dataloader"
import { Brackets, In } from "typeorm"
import { Action } from "../Entity/Action"
import { Listing } from "../Entity/Listing"
import { Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { Split } from "../Entity/Split"


/**
 * Given a list of objkt IDs, outputs a list of Objkt entities
 */
const batchObjkts = async (ids) => {
	const objkts = await Objkt.find({
		where: {
			id: In(ids)
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
const batchObjktActions = async (ids) => {
	const actions = await Action.createQueryBuilder("action")
		.select()
		.where("action.objktId IN (:...ids)", { ids })
		.orderBy("action.createdAt", "DESC")
		.getMany()
	return ids.map((id: number) => actions.filter(
		action => action.objktId === id)
	)
}
export const createObjktActionsLoader = () => new DataLoader(batchObjktActions)

/**
 * Given a list of Generative Token IDs, outputs their splits on the
 * **primary** market.
 */
 const batchObjktRoyaltiesSplits = async (ids) => {
	const splits = await Split.createQueryBuilder("split")
		.select()
		.where("split.objktId IN(:...ids)", { ids })
		.getMany()
	return ids.map(id => 
		splits.filter(split => split.objktId === id)
	)
}
export const createObjktRoyaltiesSplitsLoader = () => new DataLoader(
	batchObjktRoyaltiesSplits
)

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
export const createObjktListingsLoader = () => new DataLoader(
	batchObjktListings
)

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
export const createObjktActiveListingsLoader = () => new DataLoader(
	batchObjktActiveListings
)


/**
 * Given a list of objkt IDs, returns a list of offers
 */
const batchObjktOffers = async (inputs: any) => {
	// we extract the ids and the filters if any
	const ids = inputs.map(input => input.id)
	const filters = inputs[0]?.filters

	const query = Offer.createQueryBuilder("offer")
		.select()
		.where("offer.objktId IN(:...ids)", { ids })

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

	// order by creation time
	query.orderBy("offer.createdAt", "DESC")
		
	const offers = await query.getMany()
	return ids.map(id => offers.filter(l => l.objktId === id))
}
export const createObjktOffersLoader = () => new DataLoader(
	batchObjktOffers
)