import { Ctx, FieldResolver, Resolver, Root } from "type-graphql"
import { Article } from "../Entity/Article"
import { ArticleLedger } from "../Entity/ArticleLedger"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"


@Resolver(ArticleLedger)
export class ArticleLedgerResolver {
  @FieldResolver(() => User, {
    description: "The tezos entity targetted by the entry in the ledger."
  })
  owner(
    @Root() ledger: ArticleLedger,
    @Ctx() ctx: RequestContext,
  ) {
    return ctx.usersLoader.load(ledger.ownerId)
  }

  @FieldResolver(() => Article, {
    description: "The article linked to the ledger entry."
  })
  article(
    @Root() ledger: ArticleLedger,
    @Ctx() ctx: RequestContext,
  ) {
    return ctx.articlesLoader.load(ledger.articleId)
  }
}