export enum MintFeedbackResponse {
  QUERY_RECEIVED      = "QUERY_RECEIVED"
}

export enum MintFeedbackError {
  UNKNOWN             = "UNKNOWN",
  NO_OPERATION        = "NO_OPERATION",
  NO_TOKEN_ID         = "NO_TOKEN_ID"
}

export const MintFeedbackErrors = Object.values(MintFeedbackError)

export enum SigningState {
  NONE =                  "NONE",
  NOT_FOUND =             "NOT_FOUND",
  QUEUED =                "QUEUED",
  GENERATING_METADATA =   "GENERATING_METADATA",
  METADATA_GENERATED =    "METADATA_GENERATED",
  CALLING_CONTRACT =      "CALLING_CONTRACT",
  SIGNED =                "SIGNED",
}