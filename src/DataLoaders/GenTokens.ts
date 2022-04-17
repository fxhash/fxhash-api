import DataLoader from "dataloader"
import { Brackets, In } from "typeorm"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { MarketStats } from "../Entity/MarketStats"
import { MarketStatsHistory } from "../Entity/MarketStatsHistory"
import { Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { PricingDutchAuction } from "../Entity/PricingDutchAuction"
import { PricingFixed } from "../Entity/PricingFixed"
import { Report } from "../Entity/Report"
import { Reserve } from "../Entity/Reserve"
import { Split } from "../Entity/Split"
import { processGentkFeatureFilters } from "../Utils/Filters"


/**
 * Given a list of Generative Token IDs, outputs the corresponding Generative
 * Tokens.
 */
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
	const featureFilters = genIds[0].featureFilters
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

	// if we have some filters on the features
	if (featureFilters?.length > 0) {
		const processed = processGentkFeatureFilters(featureFilters)
		// filtering features is a little bit tricky, because we have to group where operations
		// in a specific way. Let's say that we have 2 features:
		// - A [a, b, c, d]
		// - B [a, b, c, d]
		// If we want to select Aa and Ab, we want all the gentks where A is a OR b
		// If we want to select Ba and Bb, we want all the gentks where B is a OR b
		// If we want to select Aa and Ba, we want all the gentks where A is a AND B is b
		// so we need to query each single feature values in a OR and each different feature in AND
		for (let i = 0; i < processed.length; i++) {
			const filterGroup = processed[i]
			query = query.andWhere(new Brackets(qb => {
				for (let j = 0; j < filterGroup.length; j++) {
					const filter = filterGroup[j]
					qb.orWhere(`objkt.features::jsonb @> :filter_${i}_${j}`, { 
						[`filter_${i}_${j}`]: filter
					})
				}
			}))
		}
	}

	// if the filters says "OFFER NOT NULL", we can use inner join to filter query
	if (filters && filters.activeListing_exist === true) {
		query = query.innerJoinAndSelect(
			"objkt.listings",
			"listing",
			"listing.acceptedAt is null AND listing.cancelledAt is null"
		)
	}

	// add sorting
	if (sorts) {
		for (const sort in sorts) {
			if (sort === "listingPrice") {
				query = query.addOrderBy("listing.price", sorts[sort], "NULLS LAST")
			}
			else if (sort === "listingCreatedAt") {
				query = query.addOrderBy("listing.createdAt", sorts[sort],"NULLS LAST")
			}
			else {
				query = query.addOrderBy(`objkt.${sort}`, sorts[sort], "NULLS LAST")
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

/**
 * Given a list of Generative Tokens, outputs their PricingFixed if any
 */
const batchGenTokPricingFixed = async (ids) => {
	const pricings = await PricingFixed.createQueryBuilder("pricing")
		.select()
		.where("pricing.tokenId IN(:...ids)", { ids })
		.getMany()
	return ids.map(id => 
		pricings.find(pricing => pricing.tokenId === id) || null	
	)
}
export const createGenTokPricingFixedLoader = () => new DataLoader(
	batchGenTokPricingFixed
)

/**
 * Given a list of Generative Tokens, outputs their PricingFixed if any
 */
 const batchGenTokPricingDutchAuction = async (ids) => {
	const pricings = await PricingDutchAuction.createQueryBuilder("pricing")
		.select()
		.where("pricing.tokenId IN(:...ids)", { ids })
		.getMany()
	return ids.map(id => 
		pricings.find(pricing => pricing.tokenId === id) || null	
	)
}
export const createGenTokPricingDutchAuctionLoader = () => new DataLoader(
	batchGenTokPricingDutchAuction
)

/**
 * Given a list of Generative Token IDs, outputs their splits on the
 * **primary** market.
 */
const batchGenTokPrimarySplits = async (ids) => {
	const splits = await Split.createQueryBuilder("split")
		.select()
		.where("split.generativeTokenPrimaryId IN(:...ids)", { ids })
		.getMany()
	return ids.map(id => 
		splits.filter(split => split.generativeTokenPrimaryId === id)
	)
}
export const createGentkTokPrimarySplitsLoader = () => new DataLoader(
	batchGenTokPrimarySplits
)

/**
 * Given a list of Generative Token IDs, outputs their splits on the 
 * **secondary** market.
 */
 const batchGenTokSecondarySplits = async (ids) => {
	const splits = await Split.createQueryBuilder("split")
		.select()
		.where("split.generativeTokenSecondaryId IN(:...ids)", { ids })
		.getMany()
	return ids.map(id => 
		splits.filter(split => split.generativeTokenSecondaryId === id)
	)
}
export const createGentkTokSecondarySplitsLoader = () => new DataLoader(
	batchGenTokSecondarySplits
)

const batchGenTokReports = async (genIds) => {
	const reports = await Report.find({
		where: {
			token: In(genIds)
		},
    order: {
      id: "DESC"
    },
		// cache: 10000
	})
	return genIds.map((id: number) => reports.filter(report => report.tokenId === id))
}
export const createGenTokReportsLoader = () => new DataLoader(batchGenTokReports)

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
export const createGenTokMarketStatsLoader = () => new DataLoader(
	batchGenTokMarketStats
)

/**
 * Given a list of Generator IDs, returns a list of market place histories
 * param: {
 *   id: the ID of the token,
 *   from: the date to search from
 *   to: the date to search to
 * }
 */
const batchGenTokMarketStatsHistory = async (params): Promise<MarketStatsHistory[]> => {
	const { from, to } = params[0]
	const ids = params.map(param => param.id)

	const query = MarketStatsHistory.createQueryBuilder("hist")
		.select()
		.where("hist.tokenId IN (:...ids)", { ids })
		.andWhere("hist.from >= :from", { from })
		.andWhere("hist.to < :to", { to })
		.orderBy("hist.from", "ASC")
	
	const hists = await query.getMany()

	return ids.map(id => hists.filter(hist => hist.tokenId === id))
}
export const createGenTokMarketStatsHistoryLoader = () => new DataLoader(
	batchGenTokMarketStatsHistory
)


/**
 * Given a list of Generative Tokens, outputs a list of all the features 
 * of their Gentks
 * This list is determined by checking all the features of all the gentks
 * generated, by grouping features and by counting occurences of each trait
 */
const batchGenTokObjktFeatures = async (ids) => {
	const objkts = await Objkt.createQueryBuilder("objkt")
		.select(["objkt.issuerId", "objkt.features"])
		.where("objkt.issuerId IN (:...ids)", { ids })
		.getMany()
	
	const featuresByIds: any[] = []

	// for each token in the list, we compute the features
	for (const id of ids) {	// most of the time will only run once
		const features = objkts.filter(objkt => objkt.issuerId === id).map(objkt => objkt.features)

		// the map will store each feature and their values for faster access
		const traits = {}

		// 1st pass - process the traits
		if (features.length > 0) {
			// go through each gentk features
			for (const feature of features) {
				// go through each trait
				if (feature) {
					for (const trait of feature) {
						// if the trait wasn't registered yet we register it
						if (!traits[trait.name]) {
							traits[trait.name] = {}
						}
						// either create a new value if it doesn't exist
						if (!traits[trait.name][trait.value]){
							traits[trait.name][trait.value] = {
								deseria: trait.value,
								occur: 1,
							}
						}
						// or increment the value if already found
						else {
							traits[trait.name][trait.value].occur++
						}
					}
				}
			}
		}

		// 2nd pass - format the traits
		const formattedTraits: any[] = []
		for (const trait in traits) {
			const formattedValues: any[] = []
			for (const value in traits[trait]) {
				formattedValues.push({
					value: traits[trait][value].deseria,
					occur: traits[trait][value].occur,
				})
			}
			formattedTraits.push({
				name: trait,
				values: formattedValues
			})
		}

		// add the formatted features to the list (if none, adds empty array)
		featuresByIds.push(formattedTraits)
	}

	return featuresByIds
}
export const createGenTokObjktFeaturesLoader = () => new DataLoader(
	batchGenTokObjktFeatures
)

/**
 * Given a list of Generative Token IDs, returns a list of Offers for each
 * Generative Token
 */
 const batchGenTokOffers = async (inputs: any) => {
	// we extract the ids and the filters if any
	const ids = inputs.map(input => input.id)
	const filters = inputs[0]?.filters

	const query = Offer.createQueryBuilder("offer")
		.select()
		.leftJoinAndSelect("offer.objkt", "objkt")
		.leftJoinAndSelect("objkt.issuer", "issuer", "issuer.id IN(:...ids)")
		.where("issuer.id IN(:...ids)", { ids })

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

	return ids.map(id => offers.filter(
		offer => offer.objkt.issuerId === id
	))
}
export const createGenTokOffersLoader = () => new DataLoader(
	batchGenTokOffers
)

/**
 * Given a list of Generative Tokens, outputs a list of the reserves for each
 * Generative Token
 */
const batchGenTokReserves = async (ids) => {
	const reserves = await Reserve.createQueryBuilder("reserve")
		.select()
		.where("reserve.tokenId IN(:...ids)", { ids })
		.getMany()
	
	return ids.map(id => reserves.filter(reserve => reserve.tokenId === id))
}
export const createGenTokReservesLoader = () => new DataLoader(
	batchGenTokReserves
)