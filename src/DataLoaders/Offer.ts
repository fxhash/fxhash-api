import DataLoader from "dataloader"
import { In } from "typeorm"
import { Offer } from "../Entity/Offer"


const batchOffers = async (ids) => {
	const offers = await Offer.find({
		where: {
			id: In(ids)
		}
	})
	return ids.map(id => offers.find(offer => offer.id === id))
}
export const createOffersLoader = () => new DataLoader(batchOffers)

/**
 * Given a list of offer IDs, returns a list of objkts
 */
 const batchOffersObjkts = async (ids: any) => {
	const offers = await Offer.createQueryBuilder("offer")
		.select("offer.id")
		.whereInIds(ids)
		.leftJoinAndSelect("offer.objkt", "objkt")
		.getMany()

	return ids.map(id => offers.find(o => o.id === id)?.objkt)
}
export const createOfferObjktsLoader = () => new DataLoader(batchOffersObjkts)

/**
 * Given a list of offer IDs, returns a list of issuers (Users)
 */
 const batchOffersIssuers = async (ids: any) => {
	const offers = await Offer.createQueryBuilder("offer")
		.select("offer.id")
		.whereInIds(ids)
		.leftJoinAndSelect("offer.issuer", "issuer")
		.getMany()

	return ids.map(id => offers.find(o => o.id === id)?.issuer)
}
export const createOfferIssuersLoader = () => new DataLoader(batchOffersIssuers)