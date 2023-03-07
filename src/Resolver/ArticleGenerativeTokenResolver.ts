import { Ctx, FieldResolver, Resolver, Root } from "type-graphql"
import { Article } from "../Entity/Article"
import { ArticleGenerativeToken } from "../Entity/ArticleGenerativeToken"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { TokenId } from "../Scalar/TokenId"
import { RequestContext } from "../types/RequestContext"

@Resolver(ArticleGenerativeToken)
export class ArticleGenerativeTokenResolver {
  @FieldResolver(() => Article, {
    description: "The article which is mentionning the Generative Token",
  })
  article(@Root() mention: ArticleGenerativeToken, @Ctx() ctx: RequestContext) {
    return ctx.articlesLoader.load(mention.articleId)
  }

  @FieldResolver(() => GenerativeToken, {
    description: "The Generative Token mentionned by the Article.",
  })
  generativeToken(
    @Root() mention: ArticleGenerativeToken,
    @Ctx() ctx: RequestContext
  ) {
    return ctx.genTokLoader.load(
      new TokenId({
        id: mention.generativeTokenId,
        version: mention.generativeTokenVersion,
      })
    )
  }
}
