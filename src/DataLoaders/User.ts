import DataLoader from "dataloader"
import { Brackets, In } from "typeorm"
import { Objkt } from "../Entity/Objkt"
import { User, UserType } from "../Entity/User"
import { Collaboration } from "../Entity/Collaboration"
import { Offer } from "../Entity/Offer"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { generativeQueryFilter } from "../Query/Filters/GenerativeToken"
import { Action, TokenActionType } from "../Entity/Action"


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


/**
 * Given a list of user ids, outputs a list of list of Generative Tokens,
 * in which each user has its generative tokens
 */
const batchUsersGenerativeTokens = async (users: any) => {
	// we extract the IDs, filters & sort arguments
	const ids = users.map(u => u.id)
	const filters = users[0]?.filters
	const sort = users[0]?.sort
	const take = users[0]?.take
	const skip = users[0]?.skip

	let query = GenerativeToken.createQueryBuilder("token")
		.select()
		.leftJoinAndSelect("token.author", "author")
		.leftJoinAndSelect("author.collaborationContracts", "collabs")
		.leftJoinAndSelect("collabs.collaborator", "collaborator")
		.andWhere(new Brackets(qb => {
			qb.where("token.authorId IN(:...ids)", { ids })
				.orWhere("collaborator.id IN(:...ids)", { ids })
		}))

	// add filters / sorts
	query = await generativeQueryFilter(
		query,
		filters,
		sort,
	)
	
	// add pagination
	if (take) {
		query.take(take)
	}
	if (skip) {
		query.skip(skip)
	}
		
	const results = await query.getMany()

	// map user to their work (either direct or collab)
	return ids.map(
		id => results.filter(
			tok => 
				tok.author!.id === id
				|| (tok.author!.type === UserType.COLLAB_CONTRACT_V1
						&& tok.author!.collaborationContracts.find(
							collab => collab.collaborator.id === id
						)
				)
		)
	)
}
export const createUsersGenerativeTokensLoader = () => new DataLoader(
	batchUsersGenerativeTokens
)


/**
 * Given a list of user ids, outputs a list of a list of actions of type
 * "LISTING_ACCEPTED" in which the user is either the direct seller or
 * an artist who authored the project.
 */
const batchUsersSales = async (userIds: any) => {
	// select listing accepted
	const query = Action.createQueryBuilder("action")
		.select()
		.where(new Brackets(
			qb => qb
				.where({ type: TokenActionType.LISTING_V1_ACCEPTED })
				.orWhere({ type: TokenActionType.LISTING_V2_ACCEPTED })
		))

	// the joins to get back to the user
	query.leftJoin("action.target", "seller")
		.leftJoinAndSelect("action.token", "token")
		.leftJoinAndSelect("token.author", "author")
		.leftJoinAndSelect("author.collaborationContracts", "collabs")
		.leftJoinAndSelect("collabs.collaborator", "collaborator")

	// where conditions to filter the user
	query.andWhere(new Brackets(
		qb => qb
			// the user is a direct seller
			.where("seller.id IN(:...ids)", { ids: userIds })
			// the user is the only author
			.orWhere("author.id IN(:...ids)", { ids: userIds })
			// the user is a collaborator
			.orWhere("collaborator.id IN(:...ids)", { ids: userIds })
	))
	
	// execute the query
	const actions = await query.getMany()
	
	// map each user to its results
	return userIds.map(
		(id: any) => actions.filter(
			action => action.targetId === id 
				|| action.token?.authorId === id
				|| action.token?.author?.collaborationContracts.find(c => c.collaboratorId === id)
		)
	)
}
export const createUsersSalesLoader = () => new DataLoader(
	batchUsersSales
)