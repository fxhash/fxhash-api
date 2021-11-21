import DataLoader from "dataloader"
import { In } from "typeorm"
import { Action } from "../Entity/Action"
import { GenerativeToken, GenTokFlag } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { User } from "../Entity/User"


const batchUsers = async (userIds) => {
	const users = await User.find({
		where: {
			id: In(userIds)
		}
	})
	return userIds.map(id => users.find(user => user.id === id))
}
export const createUsersLoader = () => new DataLoader(batchUsers)

const batchUsersObjkt = async (userIds) => {
	const objkts = await Objkt.find({
    relations: [ "owner" ],
		where: {
			owner: In(userIds)
		},
		order: {
			id: "DESC"
		}
	})
	return userIds.map((id: string) => objkts.filter(objkt => objkt.owner?.id === id))
}
export const createUsersObjktLoader = () => new DataLoader(batchUsersObjkt)

const batchUsersGenTok = async (userIds) => {
	const tokens = await GenerativeToken.find({
    relations: [ "author" ],
		where: [{
			flag: GenTokFlag.CLEAN,
			author: In(userIds)
		},{
			flag: GenTokFlag.NONE,
			author: In(userIds)
		}],
		order: {
			id: "DESC"
		}
	})
	return userIds.map((id: string) => tokens.filter(token => token.author?.id === id))
}
export const createUsersGenTokLoader = () => new DataLoader(batchUsersGenTok)

const batchUsersOffers = async (userIds) => {
	const offers = await Offer.find({
    relations: [ "issuer" ],
		where: {
			issuer: In(userIds)
		},
		order: {
			createdAt: "DESC"
		}
	})
	return userIds.map((id: string) => offers.filter(offer => offer.issuer?.id === id))
}
export const createUsersOffersLoader = () => new DataLoader(batchUsersOffers)

const batchUsersIssuerActions = async (userIds) => {
	const actions = await Action.find({
    relations: [ "issuer" ],
		where: {
			issuer: In(userIds)
		},
		order: {
			createdAt: "DESC"
		}
	})
	return userIds.map((id: string) => actions.filter(action => action.issuer?.id === id))
}
export const createUsersIssuerActionssLoader = () => new DataLoader(batchUsersIssuerActions)

const batchUsersTargetActions = async (userIds) => {
	const actions = await Action.find({
    relations: [ "target" ],
		where: {
			target: In(userIds)
		},
		order: {
			createdAt: "DESC"
		}
	})
	return userIds.map((id: string) => actions.filter(action => action.target?.id === id))
}
export const createUsersTargetActionssLoader = () => new DataLoader(batchUsersTargetActions)