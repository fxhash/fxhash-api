import DataLoader from "dataloader"
import { In } from "typeorm"
import { Action, TokenActionType } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"
import { Report } from "../Entity/Report"
import { GenerativeTokenMarketStats } from "../GraphQL/MarketplaceStats"


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
	// extract the IDs from the params
	const ids = genIds.map(id => id.id)
	// extract the filters from the params
	const filters = genIds[0].filters
	const sorts = genIds[0].sort

	let query = Objkt.createQueryBuilder("objkt")
		.where("objkt.issuerId IN (:...issuers)", { issuers: ids })
	
	// if the filters says "OFFER NOT NULL", we can use inner join to filter query
	if (filters.offer_ne === null) {
		query = query.innerJoin("objkt.offer", "offer")
	}

	// add sorting
	for (const sort in sorts) {
		if (sort === "offerPrice") {
			query = query.addOrderBy("offer.price", sorts[sort])
		}
		else if (sort === "offerCreatedAt") {
			query = query.addOrderBy("offer.createdAt", sorts[sort])
		}
		else {
			query = query.addOrderBy(`objkt.${sort}`, sorts[sort])
		}
	}

	const objkts = await query.getMany()

	return ids.map((id: number) => objkts.filter(objkt => objkt.issuerId === id))
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

const batchGenTokReports = async (genIds) => {
	const reports = await Report.find({
		where: {
			token: In(genIds)
		},
    order: {
      id: "DESC"
    }
	})
	return genIds.map((id: number) => reports.filter(report => report.tokenId === id))
}
export const createGenTokReportsLoader = () => new DataLoader(batchGenTokReports)

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


const batchGenTokMarketStats = async (genIds): Promise<GenerativeTokenMarketStats[]> => {
	// query to compute minimum, median, and count on the offers
	const stats = await Objkt.createQueryBuilder("objkt")
		.select("MIN(offer.price)", "floor")
		.addSelect("PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY offer.price)", "median")
		.addSelect("COUNT(offer)", "totalListing")
		.addSelect("token.id", "id")
		.leftJoin("objkt.issuer", "token")
		.leftJoin("objkt.offer", "offer")
		.where("offer is not null")
		.andWhere({
			issuer: In(genIds)
		})
		.groupBy("token.id")
		.getRawMany()

	// query to get the actions, to compute more tricky values
	const actions = await Action.createQueryBuilder("action")
		.where({
			token: In(genIds),
			type: In([TokenActionType.OFFER_ACCEPTED, TokenActionType.MINTED_FROM])
		})
		.getMany()

	// now compute, for each Generative Token, the trade volumes
	const tokensStats: GenerativeTokenMarketStats[] = []
	let filtActions: Action[]
	let filtActionsPr: Action[]
	let filtActionsSc: Action[]
	const lastDay = new Date().getTime() - (24*3600*1000)

	// turn the price of actions into integers
	actions.forEach(act => { act.metadata.price = parseInt(act.metadata.price) })

	for (const id of genIds) {
		// first create the stats object for ID
		const stat = stats.find(stat => stat.id === id)
		const tokenStats: Partial<GenerativeTokenMarketStats> = {
			floor: stat?.floor ? parseInt(stat.floor) : null,
			median: stat?.median || null,
			totalListing: stat?.totalListing ? parseInt(stat.totalListing) : null
		}

		filtActions = actions.filter(act => act.tokenId === id)
		filtActionsPr = filtActions.filter(act => act.type === TokenActionType.MINTED_FROM)
		filtActionsSc = filtActions.filter(act => act.type === TokenActionType.OFFER_ACCEPTED)
		// highest sold / lowest sold
		tokenStats.highestSold = filtActionsSc.reduce((acc, act) => act.metadata.price > acc ? act.metadata.price : acc, 0) || null
		tokenStats.lowestSold = filtActionsSc.reduce((acc, act) => act.metadata.price < acc ? act.metadata.price : acc, 9999999999999)
		tokenStats.lowestSold = tokenStats.lowestSold === 9999999999999 ? null : tokenStats.lowestSold 
		// compute the prim total
		tokenStats.primTotal = filtActionsPr.reduce((acc, act) => acc + act.metadata.price, 0)
		tokenStats.secVolumeTz = filtActionsSc.reduce((acc, act) => acc + parseInt(act.metadata.price), 0)
		tokenStats.secVolumeNb = filtActionsSc.length
		// filter the actions on the 24 last hours
		filtActionsSc = filtActionsSc.filter(act => (new Date(act.createdAt).getTime() > lastDay))
		tokenStats.secVolumeTz24 = filtActionsSc.reduce((acc, act) => acc + parseInt(act.metadata.price), 0)
		tokenStats.secVolumeNb24 = filtActionsSc.length

		// now add it to the return array
		tokensStats.push(tokenStats as GenerativeTokenMarketStats)
	}

	return tokensStats
}
export const createGenTokMarketStatsLoader = () => new DataLoader(batchGenTokMarketStats)