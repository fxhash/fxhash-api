import { createArticlesGenTokMentionsLoader, createArticlesLedgersLoader, createArticlesLoader, createArticlesRevisionsLoader, createArticlesRoyaltiesSplitsLoader } from '../DataLoaders/Articles'
import { createGentkTokPrimarySplitsLoader, createGentkTokSecondarySplitsLoader, createGenTokArticleMentionsLoader, createGenTokLoader, createGenTokMarketStatsHistoryLoader, createGenTokMarketStatsLoader, createGenTokObjktFeaturesLoader, createGenTokObjktsCountLoader, createGenTokObjktsLoader, createGenTokOffersLoader, createGenTokPricingDutchAuctionLoader, createGenTokPricingFixedLoader, createGenTokReportsLoader, createGenTokReservesLoader } from '../DataLoaders/GenTokens'
import { createMarketStatsGenTokLoader } from '../DataLoaders/MarketStats'
import { createModerationReasonsLoader } from '../DataLoaders/ModerationReason'
import { createObjktActionsLoader, createObjktActiveListingsLoader, createObjktListingsLoader, createObjktOffersLoader, createObjktRoyaltiesSplitsLoader, createObjktsLoader } from '../DataLoaders/Objkt'
import { createUsersLoader, createUsersObjktLoader, createUsersCollabContractsLoader, createCollabCollaboratorsLoader, createUsersOffersSentLoader, createUsersGenerativeTokensLoader, createUsersSalesLoader, createUsersOffersReceivedLoader, createUsersArticlesLoader, createUsersArticleLedgersLoader } from '../DataLoaders/User'
import { RequestContext } from '../types/RequestContext'

export const createContext = (req: any, res: any): RequestContext => {
	// @ts-ignore
	return ({
		req,

		// USER loaders
    usersLoader: createUsersLoader(),
		userObjktsLoader: createUsersObjktLoader(),
		userOffersSentLoader: createUsersOffersSentLoader(),
		userOffersReceivedLoader: createUsersOffersReceivedLoader(),
		userCollabContractsLoader: createUsersCollabContractsLoader(),
		collabCollaboratorsLoader: createCollabCollaboratorsLoader(),
		usersGenToksLoader: createUsersGenerativeTokensLoader(),
		usersArticlesLoader: createUsersArticlesLoader(),
		usersArticleLedgersLoader: createUsersArticleLedgersLoader(),
		usersSalesLoader: createUsersSalesLoader(),

    // GENERATIVE TOKEN loaders
    genTokLoader: createGenTokLoader(),
    genTokObjktsLoader: createGenTokObjktsLoader(),
		genTokOffersLoader: createGenTokOffersLoader(),
		gentkTokPricingFixedLoader: createGenTokPricingFixedLoader(),
		gentkTokPricingDutchAuctionLoader: createGenTokPricingDutchAuctionLoader(),
		gentTokSplitsPrimaryLoader: createGentkTokPrimarySplitsLoader(),
		gentTokSplitsSecondaryLoader: createGentkTokSecondarySplitsLoader(),
		genTokReservesLoader: createGenTokReservesLoader(),
		genTokReportsLoader: createGenTokReportsLoader(),
		genTokMarketStatsLoader: createGenTokMarketStatsLoader(),
		genTokObjktsCountLoader: createGenTokObjktsCountLoader(),
		genTokMarketStatsHistoryLoader: createGenTokMarketStatsHistoryLoader(),genTokArticleMentionsLoader: createGenTokArticleMentionsLoader(),
		genTokObjktFeaturesLoader: createGenTokObjktFeaturesLoader(),

    // OBJKTS loaders
		objktsLoader: createObjktsLoader(),
		objktRoyaltiesSplitsLoader: createObjktRoyaltiesSplitsLoader(),
    objktActionsLoader: createObjktActionsLoader(),
    objktListingsLoader: createObjktListingsLoader(),
		objktActiveListingsLoader: createObjktActiveListingsLoader(),
		objktOffersLoader: createObjktOffersLoader(),

		// ARTICLES loaders
		articlesLoader: createArticlesLoader(),
		articlesLedgersLoader: createArticlesLedgersLoader(),
		articlesGenTokMentionsLoader: createArticlesGenTokMentionsLoader(),
		articlesRevisionsLoader: createArticlesRevisionsLoader(),
		articlesRoyaltiesSplitsLoader: createArticlesRoyaltiesSplitsLoader(),

		// MARKET STATS loaders
		marketStatsGenTokLoader: createMarketStatsGenTokLoader(),
		
		// MODERATION REASON loaders
		moderationReasonsLoader: createModerationReasonsLoader(),
	})
}