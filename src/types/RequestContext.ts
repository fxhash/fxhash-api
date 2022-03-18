import { Request as ExpressRequest } from "express"
import { createGentkTokPrimarySplitsLoader, createGentkTokSecondarySplitsLoader, createGenTokActionsLoader, createGenTokLatestActionsLoader, createGenTokLatestObjktsLoader, createGenTokLoader, createGenTokMarketStatsHistoryLoader, createGenTokMarketStatsLoader, createGenTokObjktFeaturesLoader, createGenTokObjktsCountLoader, createGenTokObjktsLoader, createGenTokPricingDutchAuctionLoader, createGenTokPricingFixedLoader, createGenTokReportsLoader } from "../DataLoaders/GenTokens"
import { createListingIssuersLoader, createListingObjktsLoader, createListingsLoader } from "../DataLoaders/Listing"
import { createMarketStatsGenTokLoader } from "../DataLoaders/MarketStats"
import { createModerationReasonsLoader } from "../DataLoaders/ModerationReason"
import { createObjktActionsLoader, createObjktActiveListingsLoader, createObjktGenerativesLoader, createObjktListingsLoader, createObjktOwnersLoader, createObjktRoyaltiesSplitsLoader, createObjktsLoader } from "../DataLoaders/Objkt"
import { createUsersObjktLoader, createUsersGenTokLoader, createUsersListingsLoader, createUsersIssuerActionssLoader, 
  createUsersTargetActionssLoader, createUsersLoader, createUsersCollabContractsLoader, createCollabCollaboratorsLoader } from "../DataLoaders/User"



export interface RequestContext extends ExpressRequest {
  req: any,

	// USER loaders
	usersLoader: ReturnType<typeof createUsersLoader>,
	userObjktsLoader: ReturnType<typeof createUsersObjktLoader>,
	userGenToksLoader: ReturnType<typeof createUsersGenTokLoader>,
	userListingsLoader: ReturnType<typeof createUsersListingsLoader>,
	userIssuerActionsLoader: ReturnType<typeof createUsersIssuerActionssLoader>,
	userTargetActionsLoader: ReturnType<typeof createUsersTargetActionssLoader>,
	userCollabContractsLoader: ReturnType<typeof createUsersCollabContractsLoader>,
	collabCollaboratorsLoader: ReturnType<typeof createCollabCollaboratorsLoader>,

  // GENERATIVE TOKEN loaders
  genTokLoader: ReturnType<typeof createGenTokLoader>,
  genTokObjktsLoader: ReturnType<typeof createGenTokObjktsLoader>,
  genTokLatestObjktsLoader: ReturnType<typeof createGenTokLatestObjktsLoader>,
  genTokActionsLoader: ReturnType<typeof createGenTokActionsLoader>,
  gentkTokPricingFixedLoader: ReturnType<typeof createGenTokPricingFixedLoader>,
  gentkTokPricingDutchAuctionLoader: ReturnType<typeof createGenTokPricingDutchAuctionLoader>,
  genTokLatestActionsLoader: ReturnType<typeof createGenTokLatestActionsLoader>,
  gentTokSplitsPrimaryLoader: ReturnType<typeof createGentkTokPrimarySplitsLoader>,
  gentTokSplitsSecondaryLoader: ReturnType<typeof createGentkTokSecondarySplitsLoader>,
  genTokReportsLoader: ReturnType<typeof createGenTokReportsLoader>,
  genTokMarketStatsLoader: ReturnType<typeof createGenTokMarketStatsLoader>,
  genTokObjktsCountLoader: ReturnType<typeof createGenTokObjktsCountLoader>,
  genTokMarketStatsHistoryLoader: ReturnType<typeof createGenTokMarketStatsHistoryLoader>,
  genTokObjktFeaturesLoader: ReturnType<typeof createGenTokObjktFeaturesLoader>,

  // LISTINGS loaders
  listingsLoader: ReturnType<typeof createListingsLoader>,

  // OBJKTS loaders
  objktsLoader: ReturnType<typeof createObjktsLoader>,
  objktActionsLoader: ReturnType<typeof createObjktActionsLoader>,
  objktOwnersLoader: ReturnType<typeof createObjktOwnersLoader>,
  objktListingsLoader: ReturnType<typeof createObjktListingsLoader>,
  objktActiveListingsLoader: ReturnType<typeof createObjktActiveListingsLoader>,
  objktGenerativesLoader: ReturnType<typeof createObjktGenerativesLoader>,
  objktRoyaltiesSplitsLoader: ReturnType<typeof createObjktRoyaltiesSplitsLoader>,

	// MARKET STATS loaders
	marketStatsGenTokLoader: ReturnType<typeof createMarketStatsGenTokLoader>,

  // MODERATION REASON loaders
  moderationReasonsLoader: ReturnType<typeof createModerationReasonsLoader>,
}