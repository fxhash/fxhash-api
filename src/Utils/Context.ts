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
  createGenTokLoader,
  createGenTokMarketStatsHistoryLoader,
  createGenTokMarketStatsLoader,
  createGenTokObjktFeaturesLoader,
  createGenTokObjktsCountLoader,
  createGenTokObjktsLoader,
  createGenTokOffersLoader,
  createGenTokPricingDutchAuctionLoader,
  createGenTokPricingFixedLoader,
  createGenTokReportsLoader,
  createGenTokReservesLoader,
  createGenTokMintTicketSettingsLoader,
  createGenTokMintTicketsLoader,
  createGenTokCodexLoader,
} from "../DataLoaders/GenTokens"
import { createMarketStatsGenTokLoader } from "../DataLoaders/MarketStats"
import { createMediaImagesLoader } from "../DataLoaders/MediaImage"
import { createModerationReasonsLoader } from "../DataLoaders/ModerationReason"
import {
  createObjktActionsLoader,
  createObjktActiveListingsLoader,
  createObjktAvailableRedeemablesLoader,
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
  createUsersLoader,
  createUsersObjktLoader,
  createUsersCollabContractsLoader,
  createCollabCollaboratorsLoader,
  createUsersOffersSentLoader,
  createUsersGenerativeTokensLoader,
  createUsersSalesLoader,
  createUsersOffersReceivedLoader,
  createUsersArticlesLoader,
  createUsersArticleLedgersLoader,
  createUsersMintTicketsLoader,
} from "../DataLoaders/User"
import { RequestContext } from "../types/RequestContext"

export const createContext = (req: any, res: any): RequestContext => {
  // @ts-ignore
  return {
    req,

    // USER loaders
    usersLoader: createUsersLoader(),
    userObjktsLoader: createUsersObjktLoader(),
    userMintTicketsLoader: createUsersMintTicketsLoader(),
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
    genTokMarketStatsHistoryLoader: createGenTokMarketStatsHistoryLoader(),
    genTokArticleMentionsLoader: createGenTokArticleMentionsLoader(),
    genTokObjktFeaturesLoader: createGenTokObjktFeaturesLoader(),
    genTokRedeemablesLoader: createGentkTokRedeemablesLoader(),
    genTokMintTicketSettingsLoader: createGenTokMintTicketSettingsLoader(),
    genTokMintTicketsLoader: createGenTokMintTicketsLoader(),
    genTokCodexLoader: createGenTokCodexLoader(),

    // OBJKTS loaders
    objktsLoader: createObjktsLoader(),
    objktRoyaltiesSplitsLoader: createObjktRoyaltiesSplitsLoader(),
    objktActionsLoader: createObjktActionsLoader(),
    objktListingsLoader: createObjktListingsLoader(),
    objktActiveListingsLoader: createObjktActiveListingsLoader(),
    objktOffersLoader: createObjktOffersLoader(),
    objktRedemptionsLoader: createObjktRedemptionsLoader(),
    objktAvailableRedeemablesLoader: createObjktAvailableRedeemablesLoader(),
    objktMintedPriceLoader: createObjktMintedPriceLoader(),

    // ARTICLES loaders
    articlesLoader: createArticlesLoader(),
    articlesLedgersLoader: createArticlesLedgersLoader(),
    articlesGenTokMentionsLoader: createArticlesGenTokMentionsLoader(),
    articlesRevisionsLoader: createArticlesRevisionsLoader(),
    articlesRoyaltiesSplitsLoader: createArticlesRoyaltiesSplitsLoader(),
    articleActiveListingsLoader: createArticleActiveListingsLoader(),

    // MEDIA IMAGES loaders
    mediaImagesLoader: createMediaImagesLoader(),

    // MARKET STATS loaders
    marketStatsGenTokLoader: createMarketStatsGenTokLoader(),

    // MODERATION REASON loaders
    moderationReasonsLoader: createModerationReasonsLoader(),

    // REDEEMABLE loaders
    redeemableLoader: createRedeemableLoader(),
    reedemableSplitsLoader: createRedeemableSplitsLoader(),
    reedemableRedemptionsLoader: createRedeemableRedemptionsLoader(),
  }
}
