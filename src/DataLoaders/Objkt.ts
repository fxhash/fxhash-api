import DataLoader from "dataloader"
import { In } from "typeorm"
import { Action } from "../Entity/Action"
import { Objkt } from "../Entity/Objkt"


const batchObjkts = async (ids) => {
	const objkts = await Objkt.find({
		where: {
			id: In(ids)
		},
		cache: 10000
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
		cache: 10000
	})
	return ids.map((id: number) => actions.filter(action => action.objkt?.id === id))
}
export const createObjktActionsLoader = () => new DataLoader(batchObjktActions)