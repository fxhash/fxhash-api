import { Ctx, FieldResolver, Resolver, Root } from "type-graphql"
import { Split } from "../Entity/Split"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"

@Resolver(Split)
export class SplitResolver {
  @FieldResolver(returns => User)
  async user(
    @Root() split: Split,
    @Ctx() ctx: RequestContext,
  ) {
    return ctx.usersLoader.load(split.userId)
  }
}