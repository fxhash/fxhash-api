import DataLoader from "dataloader"
import { In } from "typeorm"
import { Action, TokenActionType } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { MarketStats } from "../Entity/MarketStats"
import { Objkt } from "../Entity/Objkt"
import { Report } from "../Entity/Report"

const batchGenTokens = async (ids) => {
	const tokens = await GenerativeToken.find({
		where: {
			id: In(ids)
		},
		cache: 10000
	})
	return ids.map(id => tokens.find(token => token.id === id))
}
export const createGenTokLoader = () => new DataLoader(batchGenTokens)

/**
 * Get the Objkts of a Generative Token, with some filters and sorting options,
 * as well as a skip/take limit
 */
const batchGenTokObjkt = async (genIds) => {
	// extract the IDs from the params
	const ids = genIds.map(id => id.id)
	// extract the filters from the params
	const filters = genIds[0].filters
	const sorts = genIds[0].sort
	const take = genIds[0].take
	const skip = genIds[0].skip

	// if there is not sort, add ID desc
	if (Object.keys(sorts).length === 0) {
		sorts.id = "DESC"
	}

	let query = Objkt.createQueryBuilder("objkt")
		.where("objkt.issuerId IN (:...issuers)", { issuers: ids })

	// if the filters says "OFFER NOT NULL", we can use inner join to filter query
	if (filters && filters.offer_ne === null) {
		query = query.innerJoinAndSelect("objkt.offer", "offer")
	}

	// add sorting
	if (sorts) {
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
	}

	// pagination
	query = query.take(take)
	query = query.skip(skip)

	// cache it
	query = query.cache(10000)

	const	objkts = await query.getMany()

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
		take: 6,
		cache: 10000
	})
	return genIds.map((id: number) => objkts.filter(objkt => objkt.issuer?.id === id))
}
export const createGenTokLatestObjktsLoader = () => new DataLoader(batchGenTokLatestObjkt)

// Get the number of objkts the token has
const batchGenTokObjktsCount = async (genIds): Promise<number[]> => {
	const counts = await Objkt.createQueryBuilder("objkt")
		.select("COUNT(objkt)", "count")
		.addSelect("objkt.issuerId", "issuerId")
		.where({
			issuer: In(genIds)
		})
		.groupBy("objkt.issuerId")
		.cache(10000)
		.getRawMany()
	
	return genIds.map((id: number) => {
		const f = counts.find(count => count.issuerId === id)
		return f ? parseInt(f.count) : 0
	})
}
export const createGenTokObjktsCountLoader = () => new DataLoader(batchGenTokObjktsCount)

const batchGenTokActions = async (ids) => {
	const actions = await Action.find({
    relations: [ "token" ],
		where: {
			token: In(ids)
		},
    order: {
      createdAt: "DESC"
    },
		cache: 10000
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
    },
		cache: 10000
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
		take: 20,
		cache: 10000
	})
	return ids.map((id: number) => actions.filter(action => action.token?.id === id))
}
export const createGenTokLatestActionsLoader = () => new DataLoader(batchGenTokLatestActions)


// interface to extend the MarketStats with a key that tells if it should get updated
class MarketStatsWithRecompute extends MarketStats {
	_shouldRecompute: boolean
}

const batchGenTokMarketStats = async (genIds): Promise<MarketStats[]> => {
	// first grab the marketplace stats for each token
	const stats = await MarketStats.find({
		where: {
			token: In(genIds)
		},
		cache: 10000
	})

	// in: 
	// - IDS of gentk
	// - array of stats
	//   - some needs to be recomputed
	//	 - some needs to be created and then computed
	//	 - some are OK
	// constraints:
	// - only 2 trips to the database allowed to compute the market stats
	// out:
	// - array of computed, ordered

	// process:
	// - create one array for what needs to be recomputed
	// - create one array for those OK

	// array for those which are OK
	const computed: MarketStats[] = []
	// array for those to (re)compute
	const recompute: MarketStats[] = []

	// used to know if we should recompute based on last computed time (1 hour)
	const now = new Date().getTime()
	// determine if the stats should be computed or not
	for (const id of genIds) {
		const stat = stats.find(stat => stat.tokenId === id)
		// if nothing was found, we need to create a new one
		if (!stat) {
			const nStat = new MarketStats()
			nStat.id = nStat.tokenId = id
			// @ts-ignore
			nStat.token = { id }
			nStat.requiresUpdate = true
			recompute.push(nStat)
			continue
		}
		// if a recompute criteria is met we set the record to null for the ID
		if (stat.requiresUpdate || (now - new Date(stat.updatedAt).getTime()) > 3600000) {
			recompute.push(stat)
			continue
		}
		// it doesn't need to be recomputed
		computed.push(stat)
	}


	// only if there is something to recompute, we recompute
	if (recompute.length > 0) {
		// build a list of IDs to recompute
		const recomputeIDs: number[] = recompute.map(stat => stat.tokenId)

		// query to compute minimum, median, and count on the offers
		const computeStats = await Objkt.createQueryBuilder("objkt")
			.select("MIN(offer.price)", "floor")
			.addSelect("PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY offer.price)", "median")
			.addSelect("COUNT(offer)", "totalListing")
			.addSelect("token.id", "id")
			.leftJoin("objkt.issuer", "token")
			.leftJoin("objkt.offer", "offer")
			.where("offer is not null")
			.andWhere({
				issuer: In(recomputeIDs)
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

		// turn the price of actions into integers
		actions.forEach(act => { act.metadata.price = parseInt(act.metadata.price) })


		// some variables used during the loop
		let filtActions: Action[]
		let filtActionsPr: Action[]
		let filtActionsSc: Action[]
		let computeStat: any
		const lastDay = new Date().getTime() - (24*3600*1000)

		// go through each "recompute" entry, and find / compute the values
		for (const stat of recompute) {
			// find if there is an entry in the recompute stats
			computeStat = computeStats.find(s => s.id === stat.tokenId)
			// if we have some values, then we can populate the stat to recompute
			if (computeStat) {
				stat.floor = parseInt(computeStat.floor)
				stat.median = computeStat.median
				stat.totalListing = parseInt(computeStat.totalListing)
			}
			// use the actions to compute the more tricky values
			filtActions = actions.filter(act => act.tokenId === stat.tokenId)
			filtActionsPr = filtActions.filter(act => act.type === TokenActionType.MINTED_FROM)
			filtActionsSc = filtActions.filter(act => act.type === TokenActionType.OFFER_ACCEPTED)
			// highest sold / lowest sold
			stat.highestSold = filtActionsSc.reduce((acc, act) => act.metadata.price > acc ? act.metadata.price : acc, 0) || null
			stat.lowestSold = filtActionsSc.reduce((acc, act) => act.metadata.price < acc ? act.metadata.price : acc, 9999999999999)
			stat.lowestSold = stat.lowestSold === 9999999999999 ? null : stat.lowestSold 
			// compute the prim total
			stat.primTotal = filtActionsPr.reduce((acc, act) => acc + act.metadata.price, 0)
			stat.secVolumeTz = filtActionsSc.reduce((acc, act) => acc + parseInt(act.metadata.price), 0)
			stat.secVolumeNb = filtActionsSc.length
			// filter the actions on the 24 last hours
			filtActionsSc = filtActionsSc.filter(act => (new Date(act.createdAt).getTime() > lastDay))
			stat.secVolumeTz24 = filtActionsSc.reduce((acc, act) => acc + parseInt(act.metadata.price), 0)
			stat.secVolumeNb24 = filtActionsSc.length

			// the stat is now properly computed, we can save it to the database
			stat.requiresUpdate = false
			await stat.save()
			computed.push(stat)
		}
	}

	return genIds.map((id: number) => computed.find(stat => stat.tokenId === id))
}
export const createGenTokMarketStatsLoader = () => new DataLoader(batchGenTokMarketStats)