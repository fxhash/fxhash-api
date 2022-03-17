import DataLoader from "dataloader"
import { In } from "typeorm"
import { Action } from "../Entity/Action"
import { GenerativeToken, GenTokFlag } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"
import { Listing } from "../Entity/Listing"
import { User, UserType } from "../Entity/User"
import { Collaboration } from "../Entity/Collaboration"


/**
 * Given a list of user IDs, resolves with an array of Users matching those
 * IDs
 */
const batchUsers = async (userIds) => {
	const users = await User.find({
		where: {
			id: In(userIds)
		},
		// cache: 10000
	})
	return userIds.map(id => users.find(user => user.id === id))
}
export const createUsersLoader = () => new DataLoader(batchUsers)

/**
 * Given a list of user IDs, returns a list of Users of type 
 * UserType.COLLAB_CONTRACT_V1 which are contracts in which the given users
 * are part of.
 */
const batchUsersCollabContracts = async (ids) => {
	const collabs = await Collaboration.createQueryBuilder("collab")
		.select()
		.leftJoinAndSelect("collab.collaborationContract", "contract")
		.where("collab.collaboratorId IN(:...ids)", { ids })
		.getMany()

	return ids.map(id => 
		collabs
			.filter(collab => collab.collaboratorId === id)
			.map(collab => collab.collaborationContract)
	)
}
export const createUsersCollabContractsLoader = () => new DataLoader(
	batchUsersCollabContracts
)

/**
 * Given a list of user IDs, returns a list of Users of type
 * UserType.REGULAR which are collaborators in the provided list of 
 * collaboration contracts/
 */
const batchCollabCollaborators = async (ids) => {
	const collabs = await Collaboration.createQueryBuilder("collab")
		.select()
		.leftJoinAndSelect("collab.collaborator", "user")
		.where("collab.collaborationContractId IN(:...ids)", { ids })
		.getMany()

	return ids.map(id => 
		collabs
			.filter(collab => collab.collaborationContractId === id)
			.map(collab => collab.collaborator)
	)
}
export const createCollabCollaboratorsLoader = () => new DataLoader(
	batchCollabCollaborators
)

const batchUsersObjkt = async (userIds) => {
	const objkts = await Objkt.find({
    relations: [ "owner" ],
		where: {
			owner: In(userIds)
		},
		order: {
			id: "DESC"
		},
		// cache: 10000
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
		},
		// cache: 10000
	})
	return userIds.map((id: string) => tokens.filter(token => token.author?.id === id))
}
export const createUsersGenTokLoader = () => new DataLoader(batchUsersGenTok)

const batchUsersListings = async (userIds) => {
	const listings = await Listing.find({
    relations: [ "issuer" ],
		where: {
			issuer: In(userIds)
		},
		order: {
			createdAt: "DESC"
		},
		// cache: 10000
	})
	return userIds.map((id: string) => listings.filter(listing => listing.issuer?.id === id))
}
export const createUsersListingsLoader = () => new DataLoader(batchUsersListings)

const batchUsersIssuerActions = async (userIds) => {
	const actions = await Action.find({
    relations: [ "issuer" ],
		where: {
			issuer: In(userIds)
		},
		order: {
			createdAt: "DESC"
		},
		// cache: 10000,
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
		},
		// cache: 10000
	})
	return userIds.map((id: string) => actions.filter(action => action.target?.id === id))
}
export const createUsersTargetActionssLoader = () => new DataLoader(batchUsersTargetActions)