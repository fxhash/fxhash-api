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
  uri: string,
  mimeType: string
}

export type TokenFeatureValueType = string|number|boolean

export interface TokenMetadataFeature {
  name: string
  value: TokenFeatureValueType
}

export interface GenerativeTokenMetadata {
  name: string,
  description: string,
  tags: string[],
  symbol: string,
  artifactUri: string,
  displayUri: string,
  thumbnailUri: string,
  creators: string[],
  formats: TokenFormat[],
  decimals: number,
}

export interface ObjktMetadata extends GenerativeTokenMetadata {
  features?: TokenMetadataFeature[]
}

export interface TokenFeature extends TokenMetadataFeature {
  rarity?: number
}