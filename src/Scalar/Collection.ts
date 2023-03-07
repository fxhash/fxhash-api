import { ObjktId, ObjktIdScalar } from "./ObjktId"
import { TokenId, TokenIdScalar } from "./TokenId"

export const ScalarCollection = [
  { type: TokenId, scalar: TokenIdScalar },
  { type: ObjktId, scalar: ObjktIdScalar },
]
