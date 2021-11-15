import DataLoader from "dataloader"
import { In } from "typeorm"
import { Action } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"


const batchGenTokens = async (ids) => {
	const tokens = await GenerativeToken.find({
		where: {
			id: In(ids)
		}
	})
	return ids.map(id => tokens.find(token => token.id === id))
}
export const createGenTokLoader = () => new DataLoader(batchGenTokens)

const batchGenTokObjkt = async (genIds) => {
	const objkts = await Objkt.find({
    relations: [ "issuer" ],
		where: {
			issuer: In(genIds)
		},
    order: {
      id: "DESC"
    }
	})
	return genIds.map((id: number) => objkts.filter(objkt => objkt.issuer?.id === id))
}
export const createGenTokObjktsLoader = () => new DataLoader(batchGenTokObjkt)

const batchGenTokLatestObjkt = async (genIds) => {
	const objkts = await Objkt.find({
    relations: [ "issuer" ],
		where: {
			issuer: In(genIds)
		},
    order: {
      id: "DESC"
    },
		take: 6
	})
	return genIds.map((id: number) => objkts.filter(objkt => objkt.issuer?.id === id))
}
export const createGenTokLatestObjktsLoader = () => new DataLoader(batchGenTokLatestObjkt)

const batchGenTokActions = async (ids) => {
	const actions = await Action.find({
    relations: [ "token" ],
		where: {
			token: In(ids)
		},
    order: {
      createdAt: "DESC"
    }
	})
	return ids.map((id: number) => actions.filter(action => action.token?.id === id))
}
export const createGenTokActionsLoader = () => new DataLoader(batchGenTokActions)

const batchGenTokLatestActions = async (ids) => {
	const actions = await Action.find({
    relations: [ "token" ],
		where: {
			token: In(ids)
		},
    order: {
      createdAt: "DESC"
    },
		take: 20
	})
	return ids.map((id: number) => actions.filter(action => action.token?.id === id))
}
export const createGenTokLatestActionsLoader = () => new DataLoader(batchGenTokLatestActions)