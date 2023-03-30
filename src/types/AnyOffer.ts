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
