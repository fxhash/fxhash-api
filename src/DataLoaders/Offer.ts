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
