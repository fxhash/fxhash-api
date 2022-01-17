import DataLoader from "dataloader"
import { In } from "typeorm"
import { Action, TokenActionType } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { MarketStats } from "../Entity/MarketStats"
import { MarketStatsHistory } from "../Entity/MarketStatsHistory"
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
	const sorts = genIds[0].sort || {}
	const take = genIds[0].take
	const skip = genIds[0].skip

	// if there is not sort, add ID desc
	if (Object.keys(sorts).length === 0) {
		sorts.id = "DESC"
	}

	let query = Objkt.createQueryBuilder("objkt")
		.select()
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
	if (take !== null && take !== undefined) {
		query = query.take(take)
	}
	if (skip !== null && skip !== undefined) {
		query = query.skip(skip)
	}

	const	objkts = await query.getMany()

	return ids.map((id: number) => objkts.filter(objkt => objkt.issuerId === id))
}
export const createGenTokObjktsLoader = () => new DataLoader(batchGenTokObjkt)

const batchGenTokLatestObjkt = async (genIds) => {
	const objkts = await Objkt.createQueryBuilder("objkt")
		.select()
		.where("objkt.issuerId IN (:...genIds)", { genIds })
		.orderBy("id", "DESC")
		.take(6)
		// .cache(10000)
		.getMany()

	return genIds.map((id: number) => objkts.filter(objkt => objkt.issuerId === id))
}
export const createGenTokLatestObjktsLoader = () => new DataLoader(batchGenTokLatestObjkt)

// Get the number of objkts the token has
const batchGenTokObjktsCount = async (genIds): Promise<number[]> => {
	const counts = await Objkt.createQueryBuilder("objkt")
		.select("COUNT(objkt)", "count")
		.addSelect("objkt.issuerId", "issuerId")
		.where("objkt.issuerId IN (:...genIds)", { genIds })
		.groupBy("objkt.issuerId")
		// .cache(10000)
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

/**
 * Given a list of Generator ids, outputs a list of pre-computed marketplace stats
 */
const batchGenTokMarketStats = async (ids): Promise<MarketStats[]> => {
	// first grab the marketplace stats for each token
	const stats = await MarketStats.createQueryBuilder("stats")
		.select()
		.where("stats.tokenId IN (:...ids)", { ids })
		// .cache(10000)
		.getMany()

	return ids.map((id: number) => stats.find(stat => stat.tokenId === id))
}
export const createGenTokMarketStatsLoader = () => new DataLoader(batchGenTokMarketStats)

/**
 * Given a list of Generator IDs, returns a list of market place histories
 */
const batchGenTokMarketStatsHistory = async (ids): Promise<MarketStatsHistory[]> => {
	const query = MarketStatsHistory.createQueryBuilder("hist")
		.select()
		.where("hist.tokenId IN (:...ids)", { ids })
		.orderBy("hist.from", "ASC")
	
	const hists = await query.getMany()

	return ids.map(id => hists.filter(hist => hist.tokenId === id))
}
export const createGenTokMarketStatsHistoryLoader = () => new DataLoader(batchGenTokMarketStatsHistory)