import { createGentkTokPrimarySplitsLoader, createGentkTokSecondarySplitsLoader, createGenTokActionsLoader, createGenTokLatestActionsLoader, createGenTokLatestObjktsLoader, createGenTokLoader, createGenTokMarketStatsHistoryLoader, createGenTokMarketStatsLoader, createGenTokObjktFeaturesLoader, createGenTokObjktsCountLoader, createGenTokObjktsLoader, createGenTokPricingDutchAuctionLoader, createGenTokPricingFixedLoader, createGenTokReportsLoader } from '../DataLoaders/GenTokens'
import { createListingIssuersLoader, createListingObjktsLoader, createListingsLoader } from '../DataLoaders/Listing'
import { createMarketStatsGenTokLoader } from '../DataLoaders/MarketStats'
import { createModerationReasonsLoader } from '../DataLoaders/ModerationReason'
import { createObjktActionsLoader, createObjktActiveListingsLoader, createObjktGenerativesLoader, createObjktListingsLoader, createObjktOwnersLoader, createObjktRoyaltiesSplitsLoader, createObjktsLoader } from '../DataLoaders/Objkt'
import { createUsersGenTokLoader, createUsersIssuerActionssLoader, createUsersLoader, createUsersObjktLoader, 
  createUsersListingsLoader, createUsersTargetActionssLoader, createUsersCollabContractsLoader, createCollabCollaboratorsLoader } from '../DataLoaders/User'
import { RequestContext } from '../types/RequestContext'

export const createContext = (req: any, res: any): RequestContext => {
	// @ts-ignore
	return ({
		req,

		// USER loaders
    usersLoader: createUsersLoader(),
		userObjktsLoader: createUsersObjktLoader(),
		userGenToksLoader: createUsersGenTokLoader(),
    userListingsLoader: createUsersListingsLoader(),
    userIssuerActionsLoader: createUsersIssuerActionssLoader(),
	  userTargetActionsLoader: createUsersTargetActionssLoader(),
		userCollabContractsLoader: createUsersCollabContractsLoader(),
		collabCollaboratorsLoader: createCollabCollaboratorsLoader(),

    // GENERATIVE TOKEN loaders
    genTokLoader: createGenTokLoader(),
    genTokObjktsLoader: createGenTokObjktsLoader(),
		genTokLatestObjktsLoader: createGenTokLatestObjktsLoader(),
    genTokActionsLoader: createGenTokActionsLoader(),
		genTokLatestActionsLoader: createGenTokLatestActionsLoader(),
		gentkTokPricingFixedLoader: createGenTokPricingFixedLoader(),
		gentkTokPricingDutchAuctionLoader: createGenTokPricingDutchAuctionLoader(),
		gentTokSplitsPrimaryLoader: createGentkTokPrimarySplitsLoader(),
		gentTokSplitsSecondaryLoader: createGentkTokSecondarySplitsLoader(),
		genTokReportsLoader: createGenTokReportsLoader(),
		genTokMarketStatsLoader: createGenTokMarketStatsLoader(),
		genTokObjktsCountLoader: createGenTokObjktsCountLoader(),
		genTokMarketStatsHistoryLoader: createGenTokMarketStatsHistoryLoader(),
		genTokObjktFeaturesLoader: createGenTokObjktFeaturesLoader(),

    // LISTINGS loaders
    listingsLoader: createListingsLoader(),

    // OBJKTS loaders
		objktsLoader: createObjktsLoader(),
    objktActionsLoader: createObjktActionsLoader(),
    objktOwnersLoader: createObjktOwnersLoader(),
    objktListingsLoader: createObjktListingsLoader(),
		objktActiveListingsLoader: createObjktActiveListingsLoader(),
    objktGenerativesLoader: createObjktGenerativesLoader(),
		objktRoyaltiesSplitsLoader: createObjktRoyaltiesSplitsLoader(),

		// MARKET STATS loaders
		marketStatsGenTokLoader: createMarketStatsGenTokLoader(),
		
		// MODERATION REASON loaders
		moderationReasonsLoader: createModerationReasonsLoader(),
	})
}