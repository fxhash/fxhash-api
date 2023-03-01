import DataLoader from "dataloader"
import { Brackets, In } from "typeorm"
import { ArticleGenerativeToken } from "../Entity/ArticleGenerativeToken"
import { Codex } from "../Entity/Codex"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { MarketStats } from "../Entity/MarketStats"
import { MarketStatsHistory } from "../Entity/MarketStatsHistory"
import { MintTicket } from "../Entity/MintTicket"
import { MintTicketSettings } from "../Entity/MintTicketSettings"
import { Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { PricingDutchAuction } from "../Entity/PricingDutchAuction"
import { PricingFixed } from "../Entity/PricingFixed"
import { Redeemable } from "../Entity/Redeemable"
import { Report } from "../Entity/Report"
import { Reserve } from "../Entity/Reserve"
import { Split } from "../Entity/Split"
import { mintTicketQueryFilter } from "../Query/Filters/MintTicket"
import { objktQueryFilter } from "../Query/Filters/Objkt"
import { offerQueryFilter } from "../Query/Filters/Offer"
import { TokenId } from "../Scalar/TokenId"
import {
  formatTokenIdTuples,
  matchesEntityTokenIdAndVersion,
} from "../Utils/GenerativeToken"

const matchesObjktIssuerIdAndVersion = (ids: readonly TokenId[]) =>
  matchesEntityTokenIdAndVersion(ids, "objkt", "issuer")

const matchesPricingTokenIdAndVersion = (ids: readonly TokenId[]) =>
  matchesEntityTokenIdAndVersion(ids, "pricing")

/**
 * Given a list of Generative Token IDs, outputs the corresponding Generative
 * Tokens.
 */
const batchGenTokens = async (ids: readonly TokenId[]) => {
  const query = GenerativeToken.createQueryBuilder("token")
    .select()
    .whereInIds(ids)
    .cache(10000)

  const tokens = await query.getMany()
  return ids.map(({ id, version }: TokenId) =>
    tokens.find(token => token.id === id && token.version === version)
  )
}
export const createGenTokLoader = () => new DataLoader(batchGenTokens)

/**
 * Get the Objkts of a Generative Token, with some filters and sorting options,
 * as well as a skip/take limit
 */
const batchGenTokObjkt = async genIds => {
  // extract the IDs from the params
  const ids = genIds.map(({ id, version }) => ({ id, version }))

  // extract the filters from the params
  const filters = genIds[0].filters
  const featureFilters = genIds[0].featureFilters
  const sorts = genIds[0].sort || {}
  const take = genIds[0].take
  const skip = genIds[0].skip

  // if there is not sort, add ID desc
  if (Object.keys(sorts).length === 0) {
    sorts.id = "DESC"
  }

  let query = Objkt.createQueryBuilder("objkt")
    .select()
    .where(matchesObjktIssuerIdAndVersion(ids))
    .leftJoin("objkt.issuer", "issuer")

  // we apply the filters and the sort arguments
  query = await objktQueryFilter(
    query,
    {
      general: filters,
      featureFilters: featureFilters,
    },
    sorts
  )

  // pagination
  if (take !== null && take !== undefined) {
    query = query.take(take)
  }
  if (skip !== null && skip !== undefined) {
    query = query.skip(skip)
  }

  const objkts = await query.getMany()

  return ids.map(({ id, version }: TokenId) =>
    objkts.filter(
      objkt => objkt.issuerId === id && objkt.issuerVersion === version
    )
  )
}
export const createGenTokObjktsLoader = () => new DataLoader(batchGenTokObjkt)

// Get the number of objkts the token has
const batchGenTokObjktsCount = async (genIds): Promise<number[]> => {
  const counts = await Objkt.createQueryBuilder("objkt")
    .select("COUNT(objkt)", "count")
    .addSelect("objkt.issuerId", "issuerId")
    .where(matchesObjktIssuerIdAndVersion(genIds))
    .groupBy("objkt.issuerId")
    // .cache(10000)
    .getRawMany()

  return genIds.map(({ id, version }: TokenId) => {
    const f = counts.find(
      count => count.issuerId === id && count.issuerVersion === version
    )
    return f ? parseInt(f.count) : 0
  })
}
export const createGenTokObjktsCountLoader = () =>
  new DataLoader(batchGenTokObjktsCount)

/**
 * Given a list of Generative Tokens, outputs their PricingFixed if any
 */
const batchGenTokPricingFixed = async (ids: readonly TokenId[]) => {
  const pricings = await PricingFixed.createQueryBuilder("pricing")
    .select()
    .where(matchesPricingTokenIdAndVersion(ids))
    .getMany()
  return ids.map(
    ({ id, version }: TokenId) =>
      pricings.find(
        pricing => pricing.tokenId === id && pricing.tokenVersion === version
      ) || null
  )
}
export const createGenTokPricingFixedLoader = () =>
  new DataLoader(batchGenTokPricingFixed)

/**
 * Given a list of Generative Tokens, outputs their PricingFixed if any
 */
const batchGenTokPricingDutchAuction = async (ids: readonly TokenId[]) => {
  const pricings = await PricingDutchAuction.createQueryBuilder("pricing")
    .select()
    .where(matchesPricingTokenIdAndVersion(ids))
    .getMany()
  return ids.map(
    ({ id, version }: TokenId) =>
      pricings.find(
        pricing => pricing.tokenId === id && pricing.tokenVersion === version
      ) || null
  )
}
export const createGenTokPricingDutchAuctionLoader = () =>
  new DataLoader(batchGenTokPricingDutchAuction)

/**
 * Given a list of Generative Token IDs, outputs their splits on the
 * **primary** market.
 */
const batchGenTokPrimarySplits = async (ids: readonly TokenId[]) => {
  const splits = await Split.createQueryBuilder("split")
    .select()
    .where(
      matchesEntityTokenIdAndVersion(ids, "split", "generativeTokenPrimary")
    )
    .getMany()
  return ids.map(({ id, version }: TokenId) =>
    splits.filter(
      split =>
        split.generativeTokenPrimaryId === id &&
        split.generativeTokenPrimaryVersion === version
    )
  )
}
export const createGentkTokPrimarySplitsLoader = () =>
  new DataLoader(batchGenTokPrimarySplits)

/**
 * Given a list of Generative Token IDs, outputs their splits on the
 * **secondary** market.
 */
const batchGenTokSecondarySplits = async (ids: readonly TokenId[]) => {
  const splits = await Split.createQueryBuilder("split")
    .select()
    .where(
      matchesEntityTokenIdAndVersion(ids, "split", "generativeTokenSecondary")
    )
    .getMany()
  return ids.map(({ id, version }: TokenId) =>
    splits.filter(
      split =>
        split.generativeTokenSecondaryId === id &&
        split.generativeTokenSecondaryVersion === version
    )
  )
}
export const createGentkTokSecondarySplitsLoader = () =>
  new DataLoader(batchGenTokSecondarySplits)

/**
 * Given a list of Article IDs, outputs a list of the ArticleGenerative token
 * instances related to the article (the mentions of a Generative Token in an
 * article)
 */
const batchGenTokArticleMentions = async (ids: readonly TokenId[]) => {
  const mentions = await ArticleGenerativeToken.createQueryBuilder("m")
    .select()
    .where(matchesEntityTokenIdAndVersion(ids, "m", "generativeToken"))
    .getMany()

  return ids.map(({ id, version }: TokenId) =>
    mentions.filter(
      mention =>
        mention.generativeTokenId === id &&
        mention.generativeTokenVersion === version
    )
  )
}
export const createGenTokArticleMentionsLoader = () =>
  new DataLoader(batchGenTokArticleMentions)

const batchGenTokReports = async genIds => {
  const reports = await Report.find({
    where: {
      token: In(genIds),
    },
    order: {
      id: "DESC",
    },
    // cache: 10000
  })
  return genIds.map((id: number) =>
    reports.filter(report => report.tokenId === id)
  )
}
export const createGenTokReportsLoader = () =>
  new DataLoader(batchGenTokReports)

/**
 * Given a list of Generator ids, outputs a list of pre-computed marketplace stats
 */
const batchGenTokMarketStats = async (ids): Promise<MarketStats[]> => {
  // first grab the marketplace stats for each token
  const stats = await MarketStats.createQueryBuilder("stats")
    .select()
    .where(matchesEntityTokenIdAndVersion(ids, "stats"))
    // .cache(10000)
    .getMany()

  return ids.map(({ id, version }: TokenId) =>
    stats.find(stat => stat.tokenId === id && stat.tokenVersion === version)
  )
}
export const createGenTokMarketStatsLoader = () =>
  new DataLoader(batchGenTokMarketStats)

/**
 * Given a list of Generator IDs, returns a list of market place histories
 * param: {
 *   id: the ID of the token,
 *   from: the date to search from
 *   to: the date to search to
 * }
 */
const batchGenTokMarketStatsHistory = async (
  params
): Promise<MarketStatsHistory[]> => {
  const { from, to } = params[0]
  const ids = params.map(({ id, version }) => ({ id, version }))

  const query = MarketStatsHistory.createQueryBuilder("hist")
    .select()
    .where(matchesEntityTokenIdAndVersion(ids, "hist"))
    .andWhere("hist.from >= :from", { from })
    .andWhere("hist.to < :to", { to })
    .orderBy("hist.from", "ASC")

  const hists = await query.getMany()

  return ids.map(({ id, version }: TokenId) =>
    hists.filter(hist => hist.tokenId === id && hist.tokenVersion === version)
  )
}
export const createGenTokMarketStatsHistoryLoader = () =>
  new DataLoader(batchGenTokMarketStatsHistory)

/**
 * Given a list of Generative Tokens, outputs a list of all the features
 * of their Gentks
 * This list is determined by checking all the features of all the gentks
 * generated, by grouping features and by counting occurences of each trait
 */
const batchGenTokObjktFeatures = async (ids: readonly TokenId[]) => {
  const objkts = await Objkt.createQueryBuilder("objkt")
    .select(["objkt.issuerId", "objkt.issuerVersion", "objkt.features"])
    .where(matchesEntityTokenIdAndVersion(ids, "objkt", "issuer"))
    .getMany()

  const featuresByIds: any[] = []

  // for each token in the list, we compute the features
  for (const tokenId of ids) {
    const { id, version } = tokenId

    // most of the time will only run once
    const features = objkts
      .filter(objkt => objkt.issuerId === id && objkt.issuerVersion === version)
      .map(objkt => objkt.features)

    // the map will store each feature and their values for faster access
    const traits = {}

    // 1st pass - process the traits
    if (features.length > 0) {
      // go through each gentk features
      for (const feature of features) {
        // go through each trait
        if (feature) {
          for (const trait of feature) {
            // if the trait wasn't registered yet we register it
            if (!traits[trait.name]) {
              traits[trait.name] = {}
            }
            // either create a new value if it doesn't exist
            if (!traits[trait.name][trait.value]) {
              traits[trait.name][trait.value] = {
                deseria: trait.value,
                occur: 1,
              }
            }
            // or increment the value if already found
            else {
              traits[trait.name][trait.value].occur++
            }
          }
        }
      }
    }

    // 2nd pass - format the traits
    const formattedTraits: any[] = []
    for (const trait in traits) {
      const formattedValues: any[] = []
      for (const value in traits[trait]) {
        formattedValues.push({
          value: traits[trait][value].deseria,
          occur: traits[trait][value].occur,
        })
      }
      formattedTraits.push({
        name: trait,
        values: formattedValues,
      })
    }

    // add the formatted features to the list (if none, adds empty array)
    featuresByIds.push(formattedTraits)
  }

  return featuresByIds
}
export const createGenTokObjktFeaturesLoader = () =>
  new DataLoader(batchGenTokObjktFeatures)

/**
 * Given a list of Generative Token IDs, returns a list of Offers for each
 * Generative Token
 */
const batchGenTokOffers = async (inputs: any) => {
  // we extract the ids and the filters if any
  const ids = inputs.map(({ id, version }) => ({ id, version }))
  const filters = inputs[0]?.filters
  const sort = inputs[0]?.sort

  const query = Offer.createQueryBuilder("offer")
    .select()
    .leftJoinAndSelect("offer.objkt", "objkt")
    .leftJoinAndSelect(
      "objkt.issuer",
      "issuer",
      `(issuer.id, issuer.version) IN (${formatTokenIdTuples(ids)})`
    )
    .where(`(issuer.id, issuer.version) IN (${formatTokenIdTuples(ids)})`)

  // apply filter/sort options
  offerQueryFilter(query, filters, sort)

  const offers = await query.getMany()

  return ids.map(({ id, version }: TokenId) =>
    offers.filter(
      offer =>
        offer.objkt.issuerId === id && offer.objkt.issuerVersion === version
    )
  )
}
export const createGenTokOffersLoader = () => new DataLoader(batchGenTokOffers)

/**
 * Given a list of Generative Tokens, outputs a list of the reserves for each
 * Generative Token
 */
const batchGenTokReserves = async (ids: readonly TokenId[]) => {
  const reserves = await Reserve.createQueryBuilder("reserve")
    .select()
    .where(matchesEntityTokenIdAndVersion(ids, "reserve"))
    .getMany()

  return ids.map(({ id, version }: TokenId) =>
    reserves.filter(
      reserve => reserve.tokenId === id && reserve.tokenVersion === version
    )
  )
}
export const createGenTokReservesLoader = () =>
  new DataLoader(batchGenTokReserves)

/**
 * Given a list of Generative Token IDs, outputs their redeemables
 */
const batchGenTokRedeemables = async (ids: readonly TokenId[]) => {
  const reds = await Redeemable.createQueryBuilder("red")
    .select()
    .where(matchesEntityTokenIdAndVersion(ids, "red"))
    .getMany()
  return ids.map(({ id, version }: TokenId) =>
    reds.filter(r => r.tokenId === id && r.tokenVersion === version)
  )
}
export const createGentkTokRedeemablesLoader = () =>
  new DataLoader(batchGenTokRedeemables)

/**
 * Given a list of Generative Token IDs, outputs their mint ticket settings
 */
const batchGenTokMintTicketSettings = async (ids: readonly TokenId[]) => {
  const settings = await MintTicketSettings.createQueryBuilder("settings")
    .select()
    .where(matchesEntityTokenIdAndVersion(ids, "settings"))
    .getMany()

  return ids.map(({ id, version }: TokenId) =>
    settings.find(s => s.tokenId === id && s.tokenVersion === version)
  )
}
export const createGenTokMintTicketSettingsLoader = () =>
  new DataLoader(batchGenTokMintTicketSettings)

/**
 * Get the MintTickets of a Generative Token, with some filters and sorting options,
 * as well as a skip/take limit
 */
const batchGenTokMintTicket = async genIds => {
  // extract the IDs from the params
  const ids = genIds.map(({ id, version }) => ({ id, version }))

  // extract the filters from the params
  const filters = genIds[0].filters
  const sorts = genIds[0].sort || {}
  const take = genIds[0].take
  const skip = genIds[0].skip

  // if there is not sort, add ID desc
  if (Object.keys(sorts).length === 0) {
    sorts.id = "DESC"
  }

  let query = MintTicket.createQueryBuilder("mintTicket")
    .select()
    .where(matchesEntityTokenIdAndVersion(ids, "mintTicket"))

  // we apply the filters and the sort arguments
  query = await mintTicketQueryFilter(
    query,
    {
      general: filters,
    },
    sorts
  )

  // pagination
  if (take !== null && take !== undefined) {
    query = query.take(take)
  }
  if (skip !== null && skip !== undefined) {
    query = query.skip(skip)
  }

  const mintTickets = await query.getMany()

  return ids.map(({ id, version }: TokenId) =>
    mintTickets.filter(
      mintTicket =>
        mintTicket.tokenId === id && mintTicket.tokenVersion === version
    )
  )
}
export const createGenTokMintTicketsLoader = () =>
  new DataLoader(batchGenTokMintTicket)

const batchGenTokCodex = async (ids: readonly TokenId[]) => {
  const codex = await Codex.createQueryBuilder("codex")
    .select()
    .whereInIds(ids.map(({ id, version }) => ({ id, tokenVersion: version })))
    .getMany()

  return ids.map(({ id, version }: TokenId) =>
    codex.find(c => c.id === id && c.tokenVersion === version)
  )
}
export const createGenTokCodexLoader = () => new DataLoader(batchGenTokCodex)
