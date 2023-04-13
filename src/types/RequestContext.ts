import { Request as ExpressRequest } from "express"
import {
  createArticleActiveListingsLoader,
  createArticlesGenTokMentionsLoader,
  createArticlesLedgersLoader,
  createArticlesLoader,
  createArticlesRevisionsLoader,
  createArticlesRoyaltiesSplitsLoader,
} from "../DataLoaders/Articles"
import {
  createGentkTokPrimarySplitsLoader,
  createGentkTokRedeemablesLoader,
  createGentkTokSecondarySplitsLoader,
  createGenTokArticleMentionsLoader,
  createGenTokCodexLoader,
  createGenTokCollectionOffersLoader,
  createGenTokLoader,
  createGenTokMarketStatsHistoryLoader,
  createGenTokMarketStatsLoader,
  createGenTokMintTicketSettingsLoader,
  createGenTokObjktFeaturesLoader,
  createGenTokObjktsCountLoader,
  createGenTokObjktsLoader,
  createGenTokOffersAndCollectionOffersLoader,
  createGenTokOffersLoader,
  createGenTokPricingDutchAuctionLoader,
  createGenTokPricingFixedLoader,
  createGenTokReportsLoader,
  createGenTokReservesLoader,
} from "../DataLoaders/GenTokens"
import { createMarketStatsGenTokLoader } from "../DataLoaders/MarketStats"
import { createMediaImagesLoader } from "../DataLoaders/MediaImage"
import { createModerationReasonsLoader } from "../DataLoaders/ModerationReason"
import {
  createObjktActionsLoader,
  createObjktActiveListingsLoader,
  createObjktAvailableRedeemablesLoader,
  createObjktLastSoldPriceLoader,
  createObjktListingsLoader,
  createObjktMintedPriceLoader,
  createObjktOffersLoader,
  createObjktRedemptionsLoader,
  createObjktRoyaltiesSplitsLoader,
  createObjktsLoader,
} from "../DataLoaders/Objkt"
import {
  createRedeemableLoader,
  createRedeemableRedemptionsLoader,
  createRedeemableSplitsLoader,
} from "../DataLoaders/Redeemable"
import {
  createUsersObjktLoader,
  createUsersLoader,
  createUsersCollabContractsLoader,
  createCollabCollaboratorsLoader,
  createUsersOffersSentLoader,
  createUsersGenerativeTokensLoader,
  createUsersSalesLoader,
  createUsersOffersReceivedLoader,
  createUsersArticlesLoader,
  createUsersArticleLedgersLoader,
  createUsersMintTicketsLoader,
  createUsersOffersAndCollectionOffersSentLoader,
  createUsersOffersAndCollectionOffersReceivedLoader,
} from "../DataLoaders/User"

export interface RequestContext extends ExpressRequest {
  req: any

  // USER loaders
  usersLoader: ReturnType<typeof createUsersLoader>
  userObjktsLoader: ReturnType<typeof createUsersObjktLoader>
  userMintTicketsLoader: ReturnType<typeof createUsersMintTicketsLoader>
  userOffersSentLoader: ReturnType<typeof createUsersOffersSentLoader>
  userOffersAndCollectionOffersSentLoader: ReturnType<
    typeof createUsersOffersAndCollectionOffersSentLoader
  >
  userOffersReceivedLoader: ReturnType<typeof createUsersOffersReceivedLoader>
  userOffersAndCollectionOffersReceivedLoader: ReturnType<
    typeof createUsersOffersAndCollectionOffersReceivedLoader
  >
  userCollabContractsLoader: ReturnType<typeof createUsersCollabContractsLoader>
  collabCollaboratorsLoader: ReturnType<typeof createCollabCollaboratorsLoader>
  usersGenToksLoader: ReturnType<typeof createUsersGenerativeTokensLoader>
  usersArticlesLoader: ReturnType<typeof createUsersArticlesLoader>
  usersArticleLedgersLoader: ReturnType<typeof createUsersArticleLedgersLoader>
  usersSalesLoader: ReturnType<typeof createUsersSalesLoader>

  // GENERATIVE TOKEN loaders
  genTokLoader: ReturnType<typeof createGenTokLoader>
  genTokObjktsLoader: ReturnType<typeof createGenTokObjktsLoader>
  genTokOffersLoader: ReturnType<typeof createGenTokOffersLoader>
  genTokCollectionOffersLoader: ReturnType<
    typeof createGenTokCollectionOffersLoader
  >
  genTokOffersAndCollectionOffersLoader: ReturnType<
    typeof createGenTokOffersAndCollectionOffersLoader
  >
  gentkTokPricingFixedLoader: ReturnType<typeof createGenTokPricingFixedLoader>
  gentkTokPricingDutchAuctionLoader: ReturnType<
    typeof createGenTokPricingDutchAuctionLoader
  >
  gentTokSplitsPrimaryLoader: ReturnType<
    typeof createGentkTokPrimarySplitsLoader
  >
  gentTokSplitsSecondaryLoader: ReturnType<
    typeof createGentkTokSecondarySplitsLoader
  >
  genTokReservesLoader: ReturnType<typeof createGenTokReservesLoader>
  genTokReportsLoader: ReturnType<typeof createGenTokReportsLoader>
  genTokMarketStatsLoader: ReturnType<typeof createGenTokMarketStatsLoader>
  genTokObjktsCountLoader: ReturnType<typeof createGenTokObjktsCountLoader>
  genTokMarketStatsHistoryLoader: ReturnType<
    typeof createGenTokMarketStatsHistoryLoader
  >
  genTokObjktFeaturesLoader: ReturnType<typeof createGenTokObjktFeaturesLoader>
  genTokArticleMentionsLoader: ReturnType<
    typeof createGenTokArticleMentionsLoader
  >
  genTokRedeemablesLoader: ReturnType<typeof createGentkTokRedeemablesLoader>
  genTokMintTicketSettingsLoader: ReturnType<
    typeof createGenTokMintTicketSettingsLoader
  >
  genTokCodexLoader: ReturnType<typeof createGenTokCodexLoader>

  // OBJKTS loaders
  objktsLoader: ReturnType<typeof createObjktsLoader>
  objktRoyaltiesSplitsLoader: ReturnType<
    typeof createObjktRoyaltiesSplitsLoader
  >
  objktActionsLoader: ReturnType<typeof createObjktActionsLoader>
  objktListingsLoader: ReturnType<typeof createObjktListingsLoader>
  objktActiveListingsLoader: ReturnType<typeof createObjktActiveListingsLoader>
  objktOffersLoader: ReturnType<typeof createObjktOffersLoader>
  objktRedemptionsLoader: ReturnType<typeof createObjktRedemptionsLoader>
  objktAvailableRedeemablesLoader: ReturnType<
    typeof createObjktAvailableRedeemablesLoader
  >
  objktLastSoldPriceLoader: ReturnType<typeof createObjktLastSoldPriceLoader>
  objktMintedPriceLoader: ReturnType<typeof createObjktMintedPriceLoader>

  // ARTICLES loaders
  articlesLoader: ReturnType<typeof createArticlesLoader>
  articlesLedgersLoader: ReturnType<typeof createArticlesLedgersLoader>
  articlesGenTokMentionsLoader: ReturnType<
    typeof createArticlesGenTokMentionsLoader
  >
  articlesRevisionsLoader: ReturnType<typeof createArticlesRevisionsLoader>
  articlesRoyaltiesSplitsLoader: ReturnType<
    typeof createArticlesRoyaltiesSplitsLoader
  >
  articleActiveListingsLoader: ReturnType<
    typeof createArticleActiveListingsLoader
  >

  // MEDIA IMAGES loaders
  mediaImagesLoader: ReturnType<typeof createMediaImagesLoader>

  // MARKET STATS loaders
  marketStatsGenTokLoader: ReturnType<typeof createMarketStatsGenTokLoader>

  // MODERATION REASON loaders
  moderationReasonsLoader: ReturnType<typeof createModerationReasonsLoader>

  // REDEEMABLE loaders
  redeemableLoader: ReturnType<typeof createRedeemableLoader>
  reedemableSplitsLoader: ReturnType<typeof createRedeemableSplitsLoader>
  reedemableRedemptionsLoader: ReturnType<
    typeof createRedeemableRedemptionsLoader
  >
}
