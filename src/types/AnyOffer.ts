import { createUnionType } from "type-graphql"
import { CollectionOffer } from "../Entity/CollectionOffer"
import { Offer } from "../Entity/Offer"

export type AnyOffer = Offer | CollectionOffer

const AnyOffer = createUnionType({
  name: "AnyOffer",
  description: "Any offer, either a collection offer or a single gentk offer",
  types: () => [CollectionOffer, Offer],
  resolveType: value => {
    if ("tokenId" in value) {
      return CollectionOffer
    }
    if ("objktId" in value) {
      return Offer
    }
    throw new Error("Could not resolve type for AnyOffer")
  },
})

const offerTypeGuard = (offer: AnyOffer): offer is Offer => {
  return (offer as Offer).objkt !== undefined
}

export { AnyOffer, offerTypeGuard }
