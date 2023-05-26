import DataLoader from "dataloader"
import { Redeemable } from "../Entity/Redeemable"
import { Redemption } from "../Entity/Redemption"
import { Split } from "../Entity/Split"
import { getManager } from "typeorm"

/**
 * Given a list of Redeemable addresses, output a list of Redeemable
 */
const batchRedeemable = async addresses => {
  const red = await Redeemable.createQueryBuilder("red")
    .select()
    .where("red.address IN(:...addresses)", { addresses })
    .getMany()
  return addresses.map(add => red.find(r => r.address === add))
}
export const createRedeemableLoader = () => new DataLoader(batchRedeemable)

/**
 * Given a list of Redeemable addresses, outputs a list of list of splits
 * corresponding to the Redeemable
 */
const batchRedeemableSplits = async ids => {
  const splits = await Split.createQueryBuilder("split")
    .select()
    .where("split.redeemableAddress IN(:...ids)", { ids })
    .getMany()
  return ids.map(id => splits.filter(split => split.redeemableAddress === id))
}
export const createRedeemableSplitsLoader = () =>
  new DataLoader(batchRedeemableSplits)

/**
 * Given a list of Redeemable addresses, outputs a list of list of redemptions
 * which are related to each redeemable.
 */
const batchRedeemableRedemptions = async ids => {
  const redemptions = await Redemption.createQueryBuilder("redemption")
    .select()
    .where("redemption.redeemableAddress IN(:...ids)", { ids })
    .getMany()
  return ids.map(id => redemptions.filter(r => r.redeemableAddress === id))
}
export const createRedeemableRedemptionsLoader = () =>
  new DataLoader(batchRedeemableRedemptions)

/**
 * Given a list of Redeemable addresses, outputs the redeemed percentage of each
 * redeemable.
 */

const batchRedeemableRedeemedPercentage = async addresses => {
  const percentages = await getManager().query(`
    SELECT 
      g.id AS "tokenId",
      d.address,
      COUNT(r.id) AS actualRedemptions,
      g.supply * d."maxConsumptionsPerToken" AS totalPossibleRedemptions,
      (COUNT(r.id) * 1.0 / (g.supply * d."maxConsumptionsPerToken")) * 100 AS "redeemedPercentage"
    FROM 
      generative_token g
    INNER JOIN 
      redeemable d ON g.id = d."tokenId"
    LEFT JOIN 
      redemption r ON d.address = r."redeemableAddress"
    WHERE
      d.address IN (${addresses.map(a => `'${a}'`).join(", ")})
    GROUP BY 
      g.id, d.address, d."maxConsumptionsPerToken"
  `)

  return addresses.map(
    address =>
      percentages.find(p => p.address === address)?.redeemedPercentage ?? 0
  )
}
export const createRedeemableRedeemedPercentageLoader = () =>
  new DataLoader(batchRedeemableRedeemedPercentage)
