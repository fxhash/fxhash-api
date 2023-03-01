import { Codex, CodexType } from "../Entity/Codex"
import { CodexUpdateRequest } from "../Entity/CodexUpdateRequest"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { MintTicket } from "../Entity/MintTicket"
import { Objkt } from "../Entity/Objkt"
import { PricingDutchAuction } from "../Entity/PricingDutchAuction"
import { PricingFixed } from "../Entity/PricingFixed"
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
  await generativeToken.save()
  return generativeToken
}

export const pricingFixedFactory = async (
  tokenId: number,
  tokenVersion: GenerativeTokenVersion = GenerativeTokenVersion.V3,
  config: any = {}
) => {
  const pricingFixed = new PricingFixed()
  pricingFixed.tokenId = tokenId
  pricingFixed.tokenVersion = tokenVersion
  pricingFixed.price = config.price || 1000000
  await pricingFixed.save()
  return pricingFixed
}

export const pricingDutchAuctionFactory = async (
  tokenId: number,
  tokenVersion: GenerativeTokenVersion = GenerativeTokenVersion.V3,
  config: any = {}
) => {
  const pricingDutchAuction = new PricingDutchAuction()
  pricingDutchAuction.tokenId = tokenId
  pricingDutchAuction.tokenVersion = tokenVersion
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
  await objkt.save()
  return objkt
}

export const mintTicketFactory = async (
  id: number,
  tokenId: number,
  userId: string,
  config: any = {}
) => {
  const generativeToken = await generativeTokenFactory(
    tokenId,
    GenerativeTokenVersion.V3
  )
  const user = await userFactory(userId)
  const mintTicket = new MintTicket()
  mintTicket.id = id
  mintTicket.token = generativeToken
  mintTicket.owner = user
  mintTicket.createdAt = new Date()
  mintTicket.taxationStart = new Date()
  mintTicket.taxationLocked = config.taxationLocked || "2000000"
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
