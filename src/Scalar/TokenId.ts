import { GraphQLScalarType, Kind } from "graphql"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"
import { GenerativeTokenVersion } from "../types/GenerativeToken"

export class TokenId {
  id: number
  version: GenerativeTokenVersion

  constructor(token: { id: number; version: GenerativeTokenVersion }) {
    this.id = token.id
    this.version = token.version
  }
}

const serializedVersionMap = {
  "0": GenerativeTokenVersion.PRE_V3,
  "1": GenerativeTokenVersion.V3,
}

const validateTokenId = (value: string): boolean => {
  const [version, id] = value.split("-")
  return version && id && serializedVersionMap[version]
}

export const parseTokenId = (value: string): TokenId => {
  const [version, id] = value.split("-")
  return new TokenId({
    id: parseInt(id),
    version: serializedVersionMap[version],
  } as GenerativeToken)
}

export const serializeTokenId = (value: TokenId): string => {
  const prefix = (() => {
    if (value.version === GenerativeTokenVersion.PRE_V3) return "0-"
    if (value.version === GenerativeTokenVersion.V3) return "1-"
    throw new Error("cannot serialize token id (version not implemented)")
  })()

  return prefix + value.id
}

export const TokenIdScalar = new GraphQLScalarType({
  name: "TokenId",
  description: "Encapsulates the version and numeric ID for a generative token",
  serialize(value: unknown): string {
    if (!(value instanceof TokenId))
      throw new Error("TokenIdScalar can only serialize TokenId values")

    return serializeTokenId(value)
  },
  parseValue(value: unknown): TokenId {
    // handle legacy numeric IDs
    if (typeof value === "number")
      return new TokenId({
        id: value,
        version: GenerativeTokenVersion.PRE_V3,
      } as GenerativeToken)

    if (typeof value !== "string")
      throw new Error(
        `TokenIdScalar can only parse string values, received: ${value}`
      )

    if (validateTokenId(value)) return parseTokenId(value)

    throw new TypeError(`TokenId cannot represent invalid ${value}.`)
  },
  parseLiteral(ast): TokenId {
    // handle legacy numeric IDs
    if (ast.kind === Kind.INT)
      return new TokenId({
        id: parseInt(ast.value),
        version: GenerativeTokenVersion.PRE_V3,
      } as GenerativeToken)

    if (ast.kind !== Kind.STRING)
      throw new Error(
        `TokenIdScalar can only parse string values, received: ${ast}`
      )

    const { value } = ast
    if (validateTokenId(value)) {
      return parseTokenId(value)
    }

    throw new TypeError(`TokenId cannot represent invalid ${value}.`)
  },
})
