import DataLoader from "dataloader"
import { Brackets, In } from "typeorm"
import { Objkt } from "../Entity/Objkt"
import { User } from "../Entity/User"
import { Collaboration } from "../Entity/Collaboration"
import { Offer } from "../Entity/Offer"


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
		.orderBy("contract.createdAt", "DESC")
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
		.orderBy("user.createdAt", "DESC")
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

/**
 * Given a list of users, outputs a list of the objkts they own
 */
const batchUsersObjkt = async (userIds) => {
	const objkts = await Objkt.find({
    relations: [ "owner" ],
		where: {
			ownerId: In(userIds)
		},
		order: {
			id: "DESC"
		},
		// cache: 10000
	})
	return userIds.map(
		(id: string) => objkts.filter(objkt => objkt.owner?.id === id)
	)
}
export const createUsersObjktLoader = () => new DataLoader(batchUsersObjkt)

/**
 * Given a list of objkt IDs, returns a list of offers
 */
 const batchUserOffers = async (inputs: any) => {
	// we extract the ids and the filters if any
	const ids = inputs.map(input => input.id)
	const filters = inputs[0]?.filters

	const query = Offer.createQueryBuilder("offer")
		.select()
		.where("offer.buyerId IN(:...ids)", { ids })

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
	return ids.map(id => offers.filter(l => l.buyerId === id))
}
export const createUsersOffersLoader = () => new DataLoader(
	batchUserOffers
)