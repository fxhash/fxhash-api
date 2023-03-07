import { FxParamDefinition } from "./Params"

export interface TokenMetadata {
  "": string
  name: string
  symbol: string
  decimals: number
}

export interface HistoryMetadata {
  [key: string]: any
}

export interface TokenFormat {
  uri: string
  mimeType: string
}

export type TokenFeatureValueType = string | number | boolean

export interface TokenMetadataFeature {
  name: string
  value: TokenFeatureValueType
}

export interface GenerativeTokenMetadata {
  name: string
  description: string
  tags: string[]
  symbol: string
  artifactUri: string
  displayUri: string
  thumbnailUri: string
  creators: string[]
  formats: TokenFormat[]
  decimals: number
  params?: {
    definition: FxParamDefinition[]
  }
}

export interface ObjktMetadata extends GenerativeTokenMetadata {
  features?: TokenMetadataFeature[]
}

export interface TokenFeature extends TokenMetadataFeature {
  rarity?: number
}

export interface MintTicketMetadata extends GenerativeTokenMetadata {}

//
// Articles
//

export interface ArticleMetadata {
  decimals: number
  symbol: "ARTKL"
  name: string
  description: string
  minter: string
  creators?: string[]
  contributors?: string[]
  type: "article"
  tags: string[]
  language: string
  artifactUri: string
  displayUri: string
  thumbnailUri: string
  platforms?: string[]
}
