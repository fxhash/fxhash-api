import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  Root,
} from "type-graphql"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Redeemable } from "../Entity/Redeemable"
import { Redemption } from "../Entity/Redemption"
import { Split } from "../Entity/Split"
import { RequestContext } from "../types/RequestContext"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"

@Resolver(Redeemable)
export class RedeemableResolver {
  @Query(() => Redeemable, {
    description: "Returns a Redeemable entity, identified by its address",
    nullable: true,
  })
  async redeemable(
    @Arg("address") address: string
  ): Promise<Redeemable | undefined> {
    return Redeemable.findOne({ address })
  }

  @Query(() => [Redeemable], {
    description:
      "Returns a list of Redeemable entities, sorted by creation time",
  })
  async redeemables(
    @Args() { skip, take }: PaginationArgs
  ): Promise<Redeemable[]> {
    ;[skip, take] = useDefaultValues([skip, take], [0, 20])
    return Redeemable.find({
      skip,
      take,
    })
  }

  @FieldResolver(() => [Split], {
    description:
      "How the amount being paid when redeeming is split between different parties",
  })
  async splits(@Root() redeemable: Redeemable, @Ctx() ctx: RequestContext) {
    if (redeemable.splits) return redeemable.splits
    return ctx.reedemableSplitsLoader.load(redeemable.address)
  }

  @FieldResolver(() => GenerativeToken, {
    description:
      "The Generative Token which can be used to use this redeemable SC",
  })
  async token(@Root() redeemable: Redeemable, @Ctx() ctx: RequestContext) {
    if (redeemable.token) return redeemable.token
    return ctx.genTokLoader.load(redeemable.tokenId)
  }

  @FieldResolver(() => [Redemption], {
    description: "All the redemption events related to this redeemable SC",
  })
  async redemptions(
    @Root() redeemable: Redeemable,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.reedemableRedemptionsLoader.load(redeemable.address)
  }
}
