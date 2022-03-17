import { createGentkTokPrimarySplitsLoader, createGentkTokSecondarySplitsLoader, createGenTokActionsLoader, createGenTokLatestActionsLoader, createGenTokLatestObjktsLoader, createGenTokLoader, createGenTokMarketStatsHistoryLoader, createGenTokMarketStatsLoader, createGenTokObjktFeaturesLoader, createGenTokObjktsCountLoader, createGenTokObjktsLoader, createGenTokPricingDutchAuctionLoader, createGenTokPricingFixedLoader, createGenTokReportsLoader } from '../DataLoaders/GenTokens'
import { createMarketStatsGenTokLoader } from '../DataLoaders/MarketStats'
import { createObjktActionsLoader, createObjktGenerativesLoader, createObjktOffersLoader, createObjktOwnersLoader, createObjktsLoader } from '../DataLoaders/Objkt'
import { createOfferIssuersLoader, createOfferObjktsLoader, createOffersLoader } from '../DataLoaders/Offer'
import { createUsersGenTokLoader, createUsersIssuerActionssLoader, createUsersLoader, createUsersObjktLoader, 
  createUsersOffersLoader, createUsersTargetActionssLoader } from '../DataLoaders/User'
import { RequestContext } from '../types/RequestContext'

export const createContext = (req: any, res: any): RequestContext => {
	// @ts-ignore
	return ({
		req,

		// USER loaders
    usersLoader: createUsersLoader(),
		userObjktsLoader: createUsersObjktLoader(),
		userGenToksLoader: createUsersGenTokLoader(),
    userOffersLoader: createUsersOffersLoader(),
    userIssuerActionsLoader: createUsersIssuerActionssLoader(),
	  userTargetActionsLoader: createUsersTargetActionssLoader(),

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

    // OFFERS loaders
    offersLoader: createOffersLoader(),
		offerObjktsLoader: createOfferObjktsLoader(),
		offerIssuersLoader: createOfferIssuersLoader(),

    // OBJKTS loaders
		objktsLoader: createObjktsLoader(),
    objktActionsLoader: createObjktActionsLoader(),
    objktOwnersLoader: createObjktOwnersLoader(),
    objktOffersLoader: createObjktOffersLoader(),
    objktGenerativesLoader: createObjktGenerativesLoader(),

		// MARKET STATS loaders
		marketStatsGenTokLoader: createMarketStatsGenTokLoader(),
	})
}