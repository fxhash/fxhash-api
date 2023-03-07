import { GraphQLScalarType, Kind } from "graphql"
import { GenerativeTokenVersion } from "../types/GenerativeToken"

const serializedVersionMap = {
  FX1: GenerativeTokenVersion.PRE_V3,
  FX2: GenerativeTokenVersion.V3,
}

/**
 * Encapsulates the issuer version and numeric ID for an objkt.
 */
export class ObjktId {
  id: number
  issuerVersion: GenerativeTokenVersion

  constructor(objkt: { id: number; issuerVersion: GenerativeTokenVersion }) {
    this.id = objkt.id
    this.issuerVersion = objkt.issuerVersion
  }

  /**
   * Validates that a string is a valid serialized ObjktId
   */
  static validate(value: string): boolean {
    const [version, id] = value.split("-")
    return version && id && serializedVersionMap[version]
  }

  /**
   * Parses a serialized ObjktId into a ObjktId instance
   */
  static parse(value: string): ObjktId {
    const [version, id] = value.split("-")
    return new ObjktId({
      id: parseInt(id),
      issuerVersion: serializedVersionMap[version],
    })
  }

  /**
   * Serializes a ObjktId instance into a string
   */
  serialize(): string {
    const prefix = (() => {
      if (this.issuerVersion === GenerativeTokenVersion.PRE_V3) return "FX1-"
      if (this.issuerVersion === GenerativeTokenVersion.V3) return "FX2-"
      throw new Error(
        `cannot serialize objkt id (version ${this.issuerVersion} not implemented)`
      )
    })()

    return prefix + this.id
  }
}

/**
 * A GraphQL scalar type for ObjktId
 */
export const ObjktIdScalar = new GraphQLScalarType({
  name: "ObjktId",
  description: "Encapsulates the version and numeric ID for a generative token",
  serialize(value: unknown): string {
    if (!(value instanceof ObjktId))
      throw new Error("ObjktIdScalar can only serialize ObjktId values")

    return value.serialize()
  },
  parseValue(value: unknown): ObjktId {
    // handle legacy numeric IDs
    if (typeof value === "number")
      return new ObjktId({
        id: value,
        issuerVersion: GenerativeTokenVersion.PRE_V3,
      })

    if (typeof value !== "string")
      throw new Error(
        `ObjktIdScalar can only parse string values, received: ${value}`
      )

    return ObjktId.parse(value)
  },
  parseLiteral(ast): ObjktId {
    // handle legacy numeric IDs
    if (ast.kind === Kind.INT)
      return new ObjktId({
        id: parseInt(ast.value),
        issuerVersion: GenerativeTokenVersion.PRE_V3,
      })

    if (ast.kind !== Kind.STRING)
      throw new Error(
        `ObjktIdScalar can only parse string values, received: ${ast}`
      )

    const { value } = ast
    if (ObjktId.validate(value)) return ObjktId.parse(value)

    throw new TypeError(`ObjktId cannot represent invalid ${value}.`)
  },
})
