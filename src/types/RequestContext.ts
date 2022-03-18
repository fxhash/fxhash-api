import { Request as ExpressRequest } from "express"
import { createGentkTokPrimarySplitsLoader, createGentkTokSecondarySplitsLoader, createGenTokLoader, createGenTokMarketStatsHistoryLoader, createGenTokMarketStatsLoader, createGenTokObjktFeaturesLoader, createGenTokObjktsCountLoader, createGenTokObjktsLoader, createGenTokPricingDutchAuctionLoader, createGenTokPricingFixedLoader, createGenTokReportsLoader } from "../DataLoaders/GenTokens"
import { createMarketStatsGenTokLoader } from "../DataLoaders/MarketStats"
import { createModerationReasonsLoader } from "../DataLoaders/ModerationReason"
import { createObjktActionsLoader, createObjktActiveListingsLoader, createObjktListingsLoader, createObjktRoyaltiesSplitsLoader, createObjktsLoader } from "../DataLoaders/Objkt"
import { createUsersObjktLoader, createUsersLoader, createUsersCollabContractsLoader, createCollabCollaboratorsLoader } from "../DataLoaders/User"



export interface RequestContext extends ExpressRequest {
  req: any,

	// USER loaders
	usersLoader: ReturnType<typeof createUsersLoader>,
	userObjktsLoader: ReturnType<typeof createUsersObjktLoader>,
	userCollabContractsLoader: ReturnType<typeof createUsersCollabContractsLoader>,
	collabCollaboratorsLoader: ReturnType<typeof createCollabCollaboratorsLoader>,

  // GENERATIVE TOKEN loaders
  genTokLoader: ReturnType<typeof createGenTokLoader>,
  genTokObjktsLoader: ReturnType<typeof createGenTokObjktsLoader>,
  gentkTokPricingFixedLoader: ReturnType<typeof createGenTokPricingFixedLoader>,
  gentkTokPricingDutchAuctionLoader: ReturnType<typeof createGenTokPricingDutchAuctionLoader>,
  gentTokSplitsPrimaryLoader: ReturnType<typeof createGentkTokPrimarySplitsLoader>,
  gentTokSplitsSecondaryLoader: ReturnType<typeof createGentkTokSecondarySplitsLoader>,
  genTokReportsLoader: ReturnType<typeof createGenTokReportsLoader>,
  genTokMarketStatsLoader: ReturnType<typeof createGenTokMarketStatsLoader>,
  genTokObjktsCountLoader: ReturnType<typeof createGenTokObjktsCountLoader>,
  genTokMarketStatsHistoryLoader: ReturnType<typeof createGenTokMarketStatsHistoryLoader>,
  genTokObjktFeaturesLoader: ReturnType<typeof createGenTokObjktFeaturesLoader>,

  // OBJKTS loaders
  objktsLoader: ReturnType<typeof createObjktsLoader>,
  objktActionsLoader: ReturnType<typeof createObjktActionsLoader>,
  objktListingsLoader: ReturnType<typeof createObjktListingsLoader>,
  objktActiveListingsLoader: ReturnType<typeof createObjktActiveListingsLoader>,
  objktRoyaltiesSplitsLoader: ReturnType<typeof createObjktRoyaltiesSplitsLoader>,

	// MARKET STATS loaders
	marketStatsGenTokLoader: ReturnType<typeof createMarketStatsGenTokLoader>,

  // MODERATION REASON loaders
  moderationReasonsLoader: ReturnType<typeof createModerationReasonsLoader>,
}