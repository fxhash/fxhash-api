import { createUnionType } from "type-graphql"
import { CollectionOffer } from "../Entity/CollectionOffer"
import { Offer } from "../Entity/Offer"

const AnyOffer = createUnionType({
  name: "AnyOffer",
  description: "Any offer, either a collection offer or a single gentk offer",
  types: () => [CollectionOffer, Offer],
  resolveType: value => {
    if ((value as CollectionOffer).tokenId !== null) {
      return CollectionOffer
    }
    if ((value as Offer).objktId !== null) {
      return Offer
    }
    throw new Error("Could not resolve type for AnyOffer")
  },
})

// fields shared by offers & collection offers
const commonFields = [
  "id",
  "version",
  "createdAt",
  "buyerId",
  "price",
  "cancelledAt",
]

// fields unique to offers
const offerFields = ["acceptedAt", "objktId", "objktIssuerVersion"]

// fields unique to collection offers
const collectionOfferFields = [
  "completedAt",
  "amount",
  "initialAmount",
  "tokenId",
]

/**
 * used to generate all fields for UNION of offers & collection offers
 *
 * uses `NULL as ${field}` for fields that are not present in the other type
 * in the UNION so that the query result contains all fields, e.g. for offers:
 *
 * id, version, createdAt, ..., NULL as completedAt, NULL as amount, ...
 */
//

const offerUnionFields = [
  ...commonFields.map(field => `"${field}"`),
  ...offerFields.map(field => `"${field}"`),
  ...collectionOfferFields.map(field => `NULL as "${field}"`),
].join(", ")

const collectionOfferUnionFields = [
  ...commonFields.map(field => `"${field}"`),
  ...offerFields.map(field => `NULL as "${field}"`),
  ...collectionOfferFields.map(field => `"${field}"`),
].join(", ")

export { AnyOffer, offerUnionFields, collectionOfferUnionFields }
