// import { Ctx, FieldResolver, Resolver, Root } from "type-graphql"
// import { Redeemable } from "../Entity/Redeemable"
// import { Redemption } from "../Entity/Redemption"
// import { User } from "../Entity/User"
// import { RequestContext } from "../types/RequestContext"
//
// @Resolver(Redemption)
// export class RedemptionResolver {
//   @FieldResolver(() => User, {
//     description: "The user who redeemed",
//   })
//   async redeemer(@Root() redemption: Redemption, @Ctx() ctx: RequestContext) {
//     if (redemption.redeemer) return redemption.redeemer
//     return ctx.usersLoader.load(redemption.redeemerId)
//   }
//
//   @FieldResolver(() => Redeemable, {
//     description: "The redeemable associated with this redemption event",
//   })
//   async redeemable(@Root() redemption: Redemption, @Ctx() ctx: RequestContext) {
//     if (redemption.redeemable) return redemption.redeemable
//     return ctx.redeemableLoader.load(redemption.redeemableAddress)
//   }
// }
