import { Request as ExpressRequest } from "express"
import { createGenTokActionsLoader, createGenTokLatestActionsLoader, createGenTokLatestObjktsLoader, createGenTokLoader, createGenTokMarketStatsHistoryLoader, createGenTokMarketStatsLoader, createGenTokObjktFeaturesLoader, createGenTokObjktsCountLoader, createGenTokObjktsLoader, createGenTokReportsLoader } from "../DataLoaders/GenTokens"
import { createMarketStatsGenTokLoader } from "../DataLoaders/MarketStats"
import { createObjktActionsLoader, createObjktGenerativesLoader, createObjktOffersLoader, createObjktOwnersLoader, createObjktsLoader } from "../DataLoaders/Objkt"
import { createOfferIssuersLoader, createOfferObjktsLoader, createOffersLoader } from "../DataLoaders/Offer"
import { createUsersObjktLoader, createUsersGenTokLoader, createUsersOffersLoader, createUsersIssuerActionssLoader, 
  createUsersTargetActionssLoader, createUsersLoader } from "../DataLoaders/User"



export interface RequestContext extends ExpressRequest {
  req: any,

	// USER loaders
	usersLoader: ReturnType<typeof createUsersLoader>,
	userObjktsLoader: ReturnType<typeof createUsersObjktLoader>,
	userGenToksLoader: ReturnType<typeof createUsersGenTokLoader>,
	userOffersLoader: ReturnType<typeof createUsersOffersLoader>,
	userIssuerActionsLoader: ReturnType<typeof createUsersIssuerActionssLoader>,
	userTargetActionsLoader: ReturnType<typeof createUsersTargetActionssLoader>,

  // GENERATIVE TOKEN loaders
  genTokLoader: ReturnType<typeof createGenTokLoader>,
  genTokObjktsLoader: ReturnType<typeof createGenTokObjktsLoader>,
  genTokLatestObjktsLoader: ReturnType<typeof createGenTokLatestObjktsLoader>,
  genTokActionsLoader: ReturnType<typeof createGenTokActionsLoader>,
  genTokLatestActionsLoader: ReturnType<typeof createGenTokLatestActionsLoader>,
  genTokReportsLoader: ReturnType<typeof createGenTokReportsLoader>,
  genTokMarketStatsLoader: ReturnType<typeof createGenTokMarketStatsLoader>,
  genTokObjktsCountLoader: ReturnType<typeof createGenTokObjktsCountLoader>,
  genTokMarketStatsHistoryLoader: ReturnType<typeof createGenTokMarketStatsHistoryLoader>,
  genTokObjktFeaturesLoader: ReturnType<typeof createGenTokObjktFeaturesLoader>,

  // OFFERS loaders
  offersLoader: ReturnType<typeof createOffersLoader>,
  offerObjktsLoader: ReturnType<typeof createOfferObjktsLoader>,
  offerIssuersLoader: ReturnType<typeof createOfferIssuersLoader>,

  // OBJKTS loaders
  objktsLoader: ReturnType<typeof createObjktsLoader>,
  objktActionsLoader: ReturnType<typeof createObjktActionsLoader>,
  objktOwnersLoader: ReturnType<typeof createObjktOwnersLoader>,
  objktOffersLoader: ReturnType<typeof createObjktOffersLoader>,
  objktGenerativesLoader: ReturnType<typeof createObjktGenerativesLoader>,

	// MARKET STATS loaders
	marketStatsGenTokLoader: ReturnType<typeof createMarketStatsGenTokLoader>,
}