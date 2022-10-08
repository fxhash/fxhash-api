import DataLoader from "dataloader"
import { In } from "typeorm"
import { MediaImage } from "../Entity/MediaImage"


/**
 * Given a list of media image ids, outputs a list of media image ids
 */
const batchMediaImages = async (ids) => {
	const medias = await MediaImage.find({
		where: {
			cid: In(ids)
		},
		// cache: 10000
	})
	return ids.map(id => medias.find(media => media.cid === id))
}
export const createMediaImagesLoader = () => new DataLoader(batchMediaImages)