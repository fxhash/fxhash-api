// import DataLoader from "dataloader"
// import { Redeemable } from "../Entity/Redeemable"
// import { Redemption } from "../Entity/Redemption"
// import { Split } from "../Entity/Split"
//
// /**
//  * Given a list of Redeemable addresses, output a list of Redeemable
//  */
// const batchRedeemable = async addresses => {
//   const red = await Redeemable.createQueryBuilder("red")
//     .select()
//     .where("red.address IN(:...addresses)", { addresses })
//     .getMany()
//   return addresses.map(add => red.find(r => r.address === add))
// }
// export const createRedeemableLoader = () => new DataLoader(batchRedeemable)
//
// /**
//  * Given a list of Redeemable addresses, outputs a list of list of splits
//  * corresponding to the Redeemable
//  */
// const batchRedeemableSplits = async ids => {
//   const splits = await Split.createQueryBuilder("split")
//     .select()
//     .where("split.redeemableAddress IN(:...ids)", { ids })
//     .getMany()
//   return ids.map(id => splits.filter(split => split.redeemableAddress === id))
// }
// export const createRedeemableSplitsLoader = () =>
//   new DataLoader(batchRedeemableSplits)
//
// /**
//  * Given a list of Redeemable addresses, outputs a list of list of redemptions
//  * which are related to each redeemable.
//  */
// const batchRedeemableRedemptions = async ids => {
//   const redemptions = await Redemption.createQueryBuilder("redemption")
//     .select()
//     .where("redemption.redeemableAddress IN(:...ids)", { ids })
//     .getMany()
//   return ids.map(id => redemptions.filter(r => r.redeemableAddress === id))
// }
// export const createRedeemableRedemptionsLoader = () =>
//   new DataLoader(batchRedeemableRedemptions)
