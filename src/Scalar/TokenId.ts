import { GraphQLScalarType, Kind } from "graphql"
import { GenerativeTokenVersion } from "../types/GenerativeToken"

const HIGHEST_PRE_V3_ID = 26000

export const offsetV3TokenId = (id: number): number => id + HIGHEST_PRE_V3_ID

/**
 * Encapsulates the version and numeric ID for a generative token.
 */
export class TokenId {
  id: number
  version: GenerativeTokenVersion

  constructor(token: { id: number; version: GenerativeTokenVersion }) {
    this.id = token.id
    this.version = token.version
  }

  /**
   * Parses a serialized TokenId into a TokenId instance
   */
  static parse(value: number): TokenId {
    if (value >= HIGHEST_PRE_V3_ID)
      return new TokenId({
        id: value - HIGHEST_PRE_V3_ID,
        version: GenerativeTokenVersion.V3,
      })

    return new TokenId({ id: value, version: GenerativeTokenVersion.PRE_V3 })
  }

  /**
   * Serializes a TokenId instance into a number
   */
  serialize(): number {
    if (this.version === GenerativeTokenVersion.PRE_V3) return this.id
    if (this.version === GenerativeTokenVersion.V3)
      return offsetV3TokenId(this.id)

    throw new Error(
      `cannot serialize token id (version ${this.version} not implemented)`
    )
  }
}

/**
 * A GraphQL scalar type for TokenId
 */
export const TokenIdScalar = new GraphQLScalarType({
  name: "TokenId",
  description: "Encapsulates the version and numeric ID for a generative token",
  serialize(value: unknown): number {
    if (!(value instanceof TokenId))
      throw new Error("TokenIdScalar can only serialize TokenId values")

    return value.serialize()
  },
  parseValue(value: unknown): TokenId {
    if (typeof value !== "number")
      throw new Error(
        `TokenIdScalar can only parse integer values, received: ${value}`
      )

    return TokenId.parse(value)
  },
  parseLiteral(ast): TokenId {
    // handle legacy numeric IDs
    if (ast.kind !== Kind.INT)
      throw new Error(
        `TokenIdScalar can only parse integer values, received: ${ast}`
      )

    const { value } = ast
    return TokenId.parse(parseInt(value))
  },
})
