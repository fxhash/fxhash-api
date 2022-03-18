import { createGentkTokPrimarySplitsLoader, createGentkTokSecondarySplitsLoader, createGenTokLoader, createGenTokMarketStatsHistoryLoader, createGenTokMarketStatsLoader, createGenTokObjktFeaturesLoader, createGenTokObjktsCountLoader, createGenTokObjktsLoader, createGenTokPricingDutchAuctionLoader, createGenTokPricingFixedLoader, createGenTokReportsLoader } from '../DataLoaders/GenTokens'
import { createMarketStatsGenTokLoader } from '../DataLoaders/MarketStats'
import { createModerationReasonsLoader } from '../DataLoaders/ModerationReason'
import { createObjktActionsLoader, createObjktActiveListingsLoader, createObjktListingsLoader, createObjktRoyaltiesSplitsLoader, createObjktsLoader } from '../DataLoaders/Objkt'
import { createUsersLoader, createUsersObjktLoader, createUsersCollabContractsLoader, createCollabCollaboratorsLoader } from '../DataLoaders/User'
import { RequestContext } from '../types/RequestContext'

export const createContext = (req: any, res: any): RequestContext => {
	// @ts-ignore
	return ({
		req,

		// USER loaders
    usersLoader: createUsersLoader(),
		userObjktsLoader: createUsersObjktLoader(),
		userCollabContractsLoader: createUsersCollabContractsLoader(),
		collabCollaboratorsLoader: createCollabCollaboratorsLoader(),

    // GENERATIVE TOKEN loaders
    genTokLoader: createGenTokLoader(),
    genTokObjktsLoader: createGenTokObjktsLoader(),
		gentkTokPricingFixedLoader: createGenTokPricingFixedLoader(),
		gentkTokPricingDutchAuctionLoader: createGenTokPricingDutchAuctionLoader(),
		gentTokSplitsPrimaryLoader: createGentkTokPrimarySplitsLoader(),
		gentTokSplitsSecondaryLoader: createGentkTokSecondarySplitsLoader(),
		genTokReportsLoader: createGenTokReportsLoader(),
		genTokMarketStatsLoader: createGenTokMarketStatsLoader(),
		genTokObjktsCountLoader: createGenTokObjktsCountLoader(),
		genTokMarketStatsHistoryLoader: createGenTokMarketStatsHistoryLoader(),
		genTokObjktFeaturesLoader: createGenTokObjktFeaturesLoader(),

    // OBJKTS loaders
		objktsLoader: createObjktsLoader(),
    objktActionsLoader: createObjktActionsLoader(),
    objktListingsLoader: createObjktListingsLoader(),
		objktActiveListingsLoader: createObjktActiveListingsLoader(),
		objktRoyaltiesSplitsLoader: createObjktRoyaltiesSplitsLoader(),

		// MARKET STATS loaders
		marketStatsGenTokLoader: createMarketStatsGenTokLoader(),
		
		// MODERATION REASON loaders
		moderationReasonsLoader: createModerationReasonsLoader(),
	})
}