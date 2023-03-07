import { v4 } from "uuid"
import { Action, TokenActionType } from "../Entity/Action"
import { Article } from "../Entity/Article"
import { ArticleGenerativeToken } from "../Entity/ArticleGenerativeToken"
import { Codex, CodexType } from "../Entity/Codex"
import { CodexUpdateRequest } from "../Entity/CodexUpdateRequest"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { GentkAssign } from "../Entity/GentkAssign"
import { Listing } from "../Entity/Listing"
import { MarketStats } from "../Entity/MarketStats"
import { MarketStatsHistory } from "../Entity/MarketStatsHistory"
import { MintTicket } from "../Entity/MintTicket"
import { MintTicketSettings } from "../Entity/MintTicketSettings"
import { ModerationReason } from "../Entity/ModerationReason"
import { Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { PricingDutchAuction } from "../Entity/PricingDutchAuction"
import { PricingFixed } from "../Entity/PricingFixed"
import { Redeemable } from "../Entity/Redeemable"
import { Redemption } from "../Entity/Redemption"
import { Report } from "../Entity/Report"
import { Reserve } from "../Entity/Reserve"
import { Split } from "../Entity/Split"
import { User } from "../Entity/User"
import { GenerativeTokenVersion } from "../types/GenerativeToken"

export const generativeTokenFactory = async (
  id: number,
  version: GenerativeTokenVersion = GenerativeTokenVersion.V3,
  config: any = {}
) => {
  const generativeToken = new GenerativeToken()
  generativeToken.id = id
  generativeToken.version = version
  generativeToken.lockEnd = config.lockEnd || new Date()
  generativeToken.balance = config.balance || 0
  generativeToken.supply = config.supply || 0
  generativeToken.mintOpensAt = new Date()
  generativeToken.createdAt = new Date().toISOString()
  generativeToken.codexId =
    config.codexId || (await codexFactory(0, { tokenVersion: version })).id
  generativeToken.authorId = config.authorId || null
  await generativeToken.save()
  return generativeToken
}

export const actionFactory = async (config: any = {}) => {
  const action = new Action()
  action.opHash = config.opHash || "opHash"
  action.tokenId = "tokenId" in config ? config.tokenId : null
  action.objktId = "objktId" in config ? config.objktId : null
  action.objktIssuerVersion = config.objktIssuerVersion || null
  // randomly select an action type if none is provided
  action.type =
    config.type ||
    TokenActionType[
      Math.floor(Math.random() * Object.keys(TokenActionType).length)
    ]
  action.numericValue = config.numericValue || null
  action.createdAt = new Date().toISOString()
  await action.save()
  return action
}

export const pricingFixedFactory = async (
  tokenId: number,
  config: any = {}
) => {
  const pricingFixed = new PricingFixed()
  pricingFixed.tokenId = tokenId
  pricingFixed.price = config.price || 1000000
  await pricingFixed.save()
  return pricingFixed
}

export const pricingDutchAuctionFactory = async (
  tokenId: number,
  config: any = {}
) => {
  const pricingDutchAuction = new PricingDutchAuction()
  pricingDutchAuction.tokenId = tokenId
  pricingDutchAuction.levels = config.level || [2000000, 1000000]
  pricingDutchAuction.restingPrice = config.restingPrice || 1000000
  pricingDutchAuction.decrementDuration = config.decrementDuration || 300
  await pricingDutchAuction.save()
  return pricingDutchAuction
}

export const userFactory = async (id: string) => {
  const user = new User()
  user.id = id
  user.createdAt = new Date().toISOString()
  user.updatedAt = new Date().toISOString()
  await user.save()
  return user
}

export const objktFactory = async (
  id: number,
  tokenVersion: GenerativeTokenVersion,
  config: any = {}
) => {
  const objkt = new Objkt()
  objkt.id = id
  objkt.issuerVersion = tokenVersion
  objkt.issuerId = config.tokenId || 0
  objkt.features = config.features || []
  await objkt.save()
  return objkt
}

export const mintTicketSettingsFactory = async (
  tokenId: number,
  config: any = {}
) => {
  const mintTicketSettings = new MintTicketSettings()
  mintTicketSettings.tokenId = tokenId
  mintTicketSettings.gracingPeriod = config.gracingPeriod || 7
  mintTicketSettings.metadata = config.metadata || {
    name: "Test",
    description: "Test",
    tags: ["test"],
    symbol: "TEST",
    artifactUri: "https://test.com",
    displayUri: "https://test.com",
    thumbnailUri: "https://test.com",
  }
  await mintTicketSettings.save()
  return mintTicketSettings
}

export const mintTicketFactory = async (
  id: number,
  tokenId: number,
  config: Partial<MintTicket> = {}
) => {
  const generativeToken = await generativeTokenFactory(
    tokenId,
    GenerativeTokenVersion.V3
  )
  const mintTicket = new MintTicket()
  mintTicket.id = id
  mintTicket.token = generativeToken
  mintTicket.ownerId = config.ownerId || (await userFactory("tz1")).id
  mintTicket.createdAt = config.createdAt || new Date()
  mintTicket.taxationStart = config.taxationStart || new Date()
  mintTicket.taxationLocked = config.taxationLocked || "2000000"
  mintTicket.taxationPaidUntil = config.taxationPaidUntil || new Date()
  mintTicket.price = config.price || 1000000
  await mintTicket.save()
  return mintTicket
}

export const codexFactory = async (id: number, config: any = {}) => {
  const codex = new Codex()
  codex.id = id
  codex.tokenVersion = config.tokenVersion || GenerativeTokenVersion.V3
  codex.type = config.type || CodexType.OFF_CHAIN
  codex.value = config.value || null
  const author = await userFactory(config.authorId || "tz1")
  codex.author = author
  codex.locked = config.locked || false
  await codex.save()
  return codex
}

export const codexUpdateRequestFactory = async (
  codexId: number,
  tokenId: number,
  config: any = {}
) => {
  const updateRequest = new CodexUpdateRequest()
  updateRequest.codexId = codexId
  updateRequest.tokenId = tokenId
  updateRequest.status = config.status || "PENDING"
  updateRequest.createdAt = config.createdAt || new Date()
  await updateRequest.save()
  return updateRequest
}

export const primarySplitFactory = async (
  tokenId: number,
  config: any = {}
) => {
  const split = new Split()
  split.generativeTokenPrimaryId = tokenId || 0
  split.pct = config.pct || 100
  await split.save()
  return split
}

export const secondarySplitFactory = async (
  tokenId: number,
  config: any = {}
) => {
  const split = new Split()
  split.generativeTokenSecondaryId = tokenId || 0
  split.pct = config.pct || 100
  await split.save()
  return split
}

export const objktSplitFactory = async (
  objktId: number,
  objktIssuerVersion: GenerativeTokenVersion = GenerativeTokenVersion.V3,
  config: any = {}
) => {
  const split = new Split()
  split.objktId = objktId || 0
  split.objktIssuerVersion = objktIssuerVersion
  split.pct = config.pct || 100
  await split.save()
  return split
}

export const articleFactory = async (id: number, config: any = {}) => {
  const article = new Article()
  article.id = id
  article.slug = config.slug || "slug"
  article.title = config.title || "title"
  article.body = config.body || "body"
  article.createdAt = new Date().toISOString()
  article.author = await userFactory(config.authorId || "tz1")
  article.description = config.description || "description"
  article.tags = config.tags || ["tag1", "tag2"]
  article.language = config.language || "en"
  article.metadataUri = config.metadataUri || "metadataUri"
  article.metadata = config.metadata || "metadata"
  article.metadataLocked = config.metadataLocked || false
  article.artifactUri = config.artifactUri || "artifactUri"
  article.displayUri = config.displayUri || "displayUri"
  article.thumbnailUri = config.thumbnailUri || "thumbnailUri"
  article.royalties = config.royalties || 0
  article.mintOpHash = config.mintOpHash || "mintOpHash"
  await article.save()
  return article
}

export const articleMentionFactory = async (
  articleId: number,
  tokenId: number,
  config: any = {}
) => {
  const mention = new ArticleGenerativeToken()
  mention.articleId = articleId || 0
  mention.generativeTokenId = tokenId || 0
  mention.line = config.line || 0
  await mention.save()
  return mention
}

export const moderationReasonFactory = async (config: any = {}) => {
  const reason = new ModerationReason()
  reason.reason = config.reason || "reason"
}

export const reportFactory = async (config: any = {}) => {
  const report = new Report()
  report.tokenId = config.tokenId
  report.userId = config.userId
  report.reason = config.reason || (await moderationReasonFactory())
  report.createdAt = config.createdAt || new Date()
  await report.save()
  return report
}

export const marketStatsFactory = async (
  tokenId: number,
  config: Partial<MarketStats> = {}
) => {
  const stats = new MarketStats()
  stats.tokenId = tokenId
  stats.floor = config.floor || 0
  await stats.save()
  return stats
}

export const marketStatsHistoryFactory = async (
  tokenId: number,
  config: Partial<MarketStatsHistory> = {}
) => {
  const history = new MarketStatsHistory()
  history.tokenId = tokenId
  history.floor = config.floor || 0
  history.from = config.from || new Date()
  history.to = config.to || new Date()
  await history.save()
  return history
}

export const listingFactory = async (
  listingId: number,
  objktId: number,
  objktIssuerVersion = GenerativeTokenVersion.PRE_V3,
  config: Partial<Listing> = {}
) => {
  const listing = new Listing()
  listing.id = listingId
  listing.version = config.version || 0
  listing.objktId = objktId
  listing.objktIssuerVersion = objktIssuerVersion
  listing.price = config.price || 0
  listing.createdAt = config.createdAt || new Date()
  await listing.save()
  return listing
}

export const offerFactory = async (
  offerId: number,
  objktId: number,
  objktIssuerVersion = GenerativeTokenVersion.PRE_V3,
  config: Partial<Offer> = {}
) => {
  const offer = new Offer()
  offer.id = offerId
  offer.version = config.version || 0
  offer.objktId = objktId
  offer.objktIssuerVersion = objktIssuerVersion
  offer.price = config.price || 0
  offer.createdAt = config.createdAt || new Date()
  await offer.save()
  return offer
}

export const reserveFactory = async (
  tokenId: number,
  config: Partial<Reserve> = {}
) => {
  const reserve = new Reserve()
  reserve.tokenId = tokenId
  reserve.amount = config.amount || 0
  reserve.method = config.method || 0
  await reserve.save()
  return reserve
}

export const redeemableFactory = async (
  tokenId: number,
  config: Partial<Redeemable> = {}
) => {
  const redeemable = new Redeemable()
  redeemable.tokenId = tokenId
  redeemable.baseAmount = config.baseAmount || 0
  redeemable.address = config.address || v4()
  redeemable.maxConsumptionsPerToken = config.maxConsumptionsPerToken || 0
  redeemable.createdAt = config.createdAt || new Date()
  await redeemable.save()
  return redeemable
}

export const redemptionFactory = async (
  objktId: number,
  objktIssuerVersion = GenerativeTokenVersion.PRE_V3,
  config: Partial<Redemption> = {}
) => {
  const redemption = new Redemption()
  redemption.objktId = objktId
  redemption.objktIssuerVersion = objktIssuerVersion
  redemption.redeemableAddress =
    config.redeemableAddress || (await redeemableFactory(0)).address
  redemption.redeemerId = config.redeemerId || "tz1"
  redemption.createdAt = config.createdAt || new Date()
  await redemption.save()
  return redemption
}

export const gentkAssignFactory = async (
  gentkId: number,
  gentkIssuerVersion = GenerativeTokenVersion.V3,
  config: Partial<GentkAssign> = {}
) => {
  const gentkAssign = new GentkAssign()
  gentkAssign.gentkId = gentkId
  gentkAssign.gentkIssuerVersion = gentkIssuerVersion
  await gentkAssign.save()
  return gentkAssign
}
