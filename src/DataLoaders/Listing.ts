import DataLoader from "dataloader"
import { In } from "typeorm"
import { Listing } from "../Entity/Listing"


const batchListings = async (ids) => {
	const listings = await Listing.find({
		where: {
			id: In(ids)
		}
	})
	return ids.map(id => listings.find(listing => listing.id === id))
}
export const createListingsLoader = () => new DataLoader(batchListings)

/**
 * Given a list of listing identifiers (ID + version), returns a list of objkts
 */
 const batchListingsObjkts = async (ids: any) => {
	const listings = await Listing.createQueryBuilder("listing")
		.select("listing.id")
		.whereInIds(ids)
		.leftJoinAndSelect("listing.objkt", "objkt")
		.getMany()

	return ids.map(id => listings.find(o => o.id === id)?.objkt)
}
export const createListingObjktsLoader = () => new DataLoader(batchListingsObjkts)

/**
 * Given a list of listing IDs, returns a list of issuers (Users)
 */
 const batchListingsIssuers = async (ids: any) => {
	const listings = await Listing.createQueryBuilder("listing")
		.select("listing.id")
		.whereInIds(ids)
		.leftJoinAndSelect("listing.issuer", "issuer")
		.getMany()

	return ids.map(id => listings.find(o => o.id === id)?.issuer)
}
export const createListingIssuersLoader = () => new DataLoader(batchListingsIssuers)