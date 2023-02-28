import { GraphQLScalarType, Kind } from "graphql"
import { GenerativeTokenVersion } from "../types/GenerativeToken"

const serializedVersionMap = {
  "0": GenerativeTokenVersion.PRE_V3,
  "1": GenerativeTokenVersion.V3,
}

export class TokenId {
  id: number
  version: GenerativeTokenVersion

  constructor(token: { id: number; version: GenerativeTokenVersion }) {
    this.id = token.id
    this.version = token.version
  }

  static validate(value: string): boolean {
    const [version, id] = value.split("-")
    return version && id && serializedVersionMap[version]
  }

  static parse(value: string): TokenId {
    const [version, id] = value.split("-")
    return new TokenId({
      id: parseInt(id),
      version: serializedVersionMap[version],
    })
  }

  serialize(): string {
    const prefix = (() => {
      if (this.version === GenerativeTokenVersion.PRE_V3) return "0-"
      if (this.version === GenerativeTokenVersion.V3) return "1-"
      throw new Error(
        `cannot serialize token id (versio ${this.version} not implemented)`
      )
    })()

    return prefix + this.id
  }
}

// convenience class for Objkt IDs
export class ObjktId extends TokenId {
  constructor(objkt: { id: number; issuerVersion: GenerativeTokenVersion }) {
    super({ id: objkt.id, version: objkt.issuerVersion })
  }
}

export const TokenIdScalar = new GraphQLScalarType({
  name: "TokenId",
  description: "Encapsulates the version and numeric ID for a generative token",
  serialize(value: unknown): string {
    if (!(value instanceof TokenId))
      throw new Error("TokenIdScalar can only serialize TokenId values")

    return value.serialize()
  },
  parseValue(value: unknown): TokenId {
    // handle legacy numeric IDs
    if (typeof value === "number")
      return new TokenId({
        id: value,
        version: GenerativeTokenVersion.PRE_V3,
      })

    if (typeof value !== "string")
      throw new Error(
        `TokenIdScalar can only parse string values, received: ${value}`
      )

    if (TokenId.validate(value)) return TokenId.parse(value)

    throw new TypeError(`TokenId cannot represent invalid ${value}.`)
  },
  parseLiteral(ast): TokenId {
    // handle legacy numeric IDs
    if (ast.kind === Kind.INT)
      return new TokenId({
        id: parseInt(ast.value),
        version: GenerativeTokenVersion.PRE_V3,
      })

    if (ast.kind !== Kind.STRING)
      throw new Error(
        `TokenIdScalar can only parse string values, received: ${ast}`
      )

    const { value } = ast
    if (TokenId.validate(value)) return TokenId.parse(value)

    throw new TypeError(`TokenId cannot represent invalid ${value}.`)
  },
})
