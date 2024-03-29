import { GenerativeToken } from "../Entity/GenerativeToken"
import { ObjktId } from "../Scalar/ObjktId"

/**
 * Given a Generative Token (with loaded pricingFixed OR pricingDutchAuction),
 * outputs the price at the time of the transaction.
 * For pricing fixed, the price will be the constant, for pricing dutch auction
 * the price will be derived from the transaction time.
 */
export function getGenerativeTokenPrice(token: GenerativeToken): number {
  // if the token has a pricing fixed, we can just return this value
  if (token.pricingFixed) {
    return token.pricingFixed.price
  }
  // otherwise we need to derive the price from the time of the transaction
  else if (token.pricingDutchAuction) {
    const { opensAt, levels, decrementDuration } = token.pricingDutchAuction

    // compute the time difference (in seconds) between opens and mint time
    const timeDiff = (Date.now() - opensAt.getTime()) / 1000
    // find the index of the level based on this time difference
    const index = Math.min(
      Math.floor(timeDiff / decrementDuration),
      levels.length - 1
    )

    // return corresponding level
    return levels[index]
  }

  throw new Error("something definitely went wrong")
}
