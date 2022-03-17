import DataLoader from "dataloader"
import { In } from "typeorm"
import { Action } from "../Entity/Action"
import { Objkt } from "../Entity/Objkt"


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

const batchObjktActions = async (ids) => {
	const actions = await Action.find({
    relations: [ "objkt" ],
		where: {
			objkt: In(ids)
		},
    order: {
      createdAt: "DESC"
    },
		// cache: 10000
	})
	return ids.map((id: number) => actions.filter(action => action.objkt?.id === id))
}
export const createObjktActionsLoader = () => new DataLoader(batchObjktActions)

/**
 * Given a list of objkt IDs, returns a list of owners
 */
const batchObjktOwners = async (ids: any) => {
	const objkts = await Objkt.createQueryBuilder("objkt")
		.select("objkt.id")
		.whereInIds(ids)
		.leftJoinAndSelect("objkt.owner", "user")
		.getMany()

	return ids.map(id => objkts.find(o => o.id === id)?.owner)
}
export const createObjktOwnersLoader = () => new DataLoader(batchObjktOwners)

/**
 * Given a list of objkt IDs, returns a list of offers
 */
 const batchObjktListings = async (ids: any) => {
	const objkts = await Objkt.createQueryBuilder("objkt")
		.select("objkt.id")
		.whereInIds(ids)
		.leftJoinAndSelect("objkt.offer", "offer")
		.getMany()

	return ids.map(id => objkts.find(o => o.id === id)?.listings)
}
export const createObjktListingsLoader = () => new DataLoader(batchObjktListings)

/**
 * Given a list of objkt IDs, returns a list of their generative tokens
 */
 const batchObjktGeneratives = async (ids: any) => {
	const objkts = await Objkt.createQueryBuilder("objkt")
		.select("objkt.id")
		.whereInIds(ids)
		.leftJoinAndSelect("objkt.issuer", "issuer")
		.getMany()

	return ids.map(id => objkts.find(o => o.id === id)?.issuer)
}
export const createObjktGenerativesLoader = () => new DataLoader(batchObjktGeneratives)