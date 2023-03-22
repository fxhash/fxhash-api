export interface GentkMetadataReqParams {
  hash: string
  owner: string
  iteration: number
  generativeMetadataCID: string
}

export enum MintError {
  UNKNOWN               = "UNKNOWN",
  BAD_REQUEST           = "BAD_REQUEST",
  TOKEN_NOT_EXISTS      = "TOKEN_NOT_EXISTS",
  TOKEN_UNAVAILABLE     = "TOKEN_UNAVAILABLE",
  FAIL_GET_METADATA     = "FAIL_GET_METADATA",
  WRONG_TOKEN_METADATA  = "WRONG_TOKEN_METADATA",
  FAIL_AUTHENTICATE     = "FAIL_AUTHENTICATE",
  FAIL_GET_TOKEN        = "FAIL_GET_TOKEN",
  INVALID_TOKEN         = "INVALID_TOKEN",
  FAIL_ADD_IPFS         = "FAIL_ADD_IPFS",
  FAIL_PREVIEW          = "FAIL_PREVIEW",
  FAIL_FEATURES         = "FAIL_FEATURES",
}

export const MintErrors: MintError[] = Object.values(MintError)

export enum MintProgressMessage {
  // call API to get token data (fail: TOKEN_NOT_EXISTS)
  GET_TOKEN_DATA = "GET_TOKEN_DATA",
  // get the metadata from IPFS (fail: FAIL_GET_METADATA)
  GET_TOKEN_METADATA = "GET_TOKEN_METADATA", 
  // get URL params files on IPFS (fail: FAIL_GET_TOKEN)
  GET_GENERATIVE_TOKEN_CONTENTS = "GET_GENERATIVE_TOKEN_CONTENTS",
  // upload project to ipfs (fail: FAIL_ADD_IPFS)
  ADD_CONTENT_IPFS = "ADD_CONTENT_IPFS", 
  // generate preview (fail: FAIL_PREVIEW)
  GENERATE_PREVIEW = "GENERATE_PREVIEW", 
  // authenticate token
  AUTHENTICATE_TOKEN = "AUTHENTICATE_TOKEN", 
}

export interface MintResponse {
  cidMetadata: string
  cidGenerative: string
  cidPreview: string
  features: any
}