import { Request as ExpressRequest } from "express"
import { createGentkTokPrimarySplitsLoader, createGentkTokSecondarySplitsLoader, createGenTokLoader, createGenTokMarketStatsHistoryLoader, createGenTokMarketStatsLoader, createGenTokObjktFeaturesLoader, createGenTokObjktsCountLoader, createGenTokObjktsLoader, createGenTokOffersLoader, createGenTokPricingDutchAuctionLoader, createGenTokPricingFixedLoader, createGenTokReportsLoader, createGenTokReservesLoader } from "../DataLoaders/GenTokens"
import { createMarketStatsGenTokLoader } from "../DataLoaders/MarketStats"
import { createModerationReasonsLoader } from "../DataLoaders/ModerationReason"
import { createObjktActionsLoader, createObjktActiveListingsLoader, createObjktListingsLoader, createObjktOffersLoader, createObjktRoyaltiesSplitsLoader, createObjktsLoader } from "../DataLoaders/Objkt"
import { createUsersObjktLoader, createUsersLoader, createUsersCollabContractsLoader, createCollabCollaboratorsLoader, createUsersOffersLoader } from "../DataLoaders/User"



export interface RequestContext extends ExpressRequest {
  req: any,

	// USER loaders
	usersLoader: ReturnType<typeof createUsersLoader>,
	userObjktsLoader: ReturnType<typeof createUsersObjktLoader>,
	userOffersLoader: ReturnType<typeof createUsersOffersLoader>,
	userCollabContractsLoader: ReturnType<typeof createUsersCollabContractsLoader>,
	collabCollaboratorsLoader: ReturnType<typeof createCollabCollaboratorsLoader>,

  // GENERATIVE TOKEN loaders
  genTokLoader: ReturnType<typeof createGenTokLoader>,
  genTokObjktsLoader: ReturnType<typeof createGenTokObjktsLoader>,
  genTokOffersLoader: ReturnType<typeof createGenTokOffersLoader>,
  gentkTokPricingFixedLoader: ReturnType<typeof createGenTokPricingFixedLoader>,
  gentkTokPricingDutchAuctionLoader: ReturnType<typeof createGenTokPricingDutchAuctionLoader>,
  gentTokSplitsPrimaryLoader: ReturnType<typeof createGentkTokPrimarySplitsLoader>,
  gentTokSplitsSecondaryLoader: ReturnType<typeof createGentkTokSecondarySplitsLoader>,
  genTokReservesLoader: ReturnType<typeof createGenTokReservesLoader>,
  genTokReportsLoader: ReturnType<typeof createGenTokReportsLoader>,
  genTokMarketStatsLoader: ReturnType<typeof createGenTokMarketStatsLoader>,
  genTokObjktsCountLoader: ReturnType<typeof createGenTokObjktsCountLoader>,
  genTokMarketStatsHistoryLoader: ReturnType<typeof createGenTokMarketStatsHistoryLoader>,
  genTokObjktFeaturesLoader: ReturnType<typeof createGenTokObjktFeaturesLoader>,

  // OBJKTS loaders
  objktsLoader: ReturnType<typeof createObjktsLoader>,
  objktRoyaltiesSplitsLoader: ReturnType<typeof createObjktRoyaltiesSplitsLoader>,
  objktActionsLoader: ReturnType<typeof createObjktActionsLoader>,
  objktListingsLoader: ReturnType<typeof createObjktListingsLoader>,
  objktActiveListingsLoader: ReturnType<typeof createObjktActiveListingsLoader>,
  objktOffersLoader: ReturnType<typeof createObjktOffersLoader>,

	// MARKET STATS loaders
	marketStatsGenTokLoader: ReturnType<typeof createMarketStatsGenTokLoader>,

  // MODERATION REASON loaders
  moderationReasonsLoader: ReturnType<typeof createModerationReasonsLoader>,
}