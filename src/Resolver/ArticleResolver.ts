import { ApolloError } from "apollo-server-express";
import { Arg, Int, Query, Resolver } from "type-graphql"
import { Article } from "../Entity/Article";

@Resolver(Article)
export class ArticleResolver {
  @Query(returns => Article, {
		nullable: true,
		description: "Get an Article by its ID or SLUG. One of those 2 must be provided for the endpoint to perform a search in the DB."
	})
	article(
		@Arg('id', () => Int, { nullable: true }) id: number,
		@Arg('slug', { nullable: true }) slug: string,
	): Promise<Article|undefined> {
		if (id == null && slug == null) {
			throw new ApolloError("Either ID or SLUG must be supllied.")
		}
		if (id != null) {
			return Article.findOne(id)
		}
		else {
			return Article.findOne({
				where: { slug }
			})
		}
	}
}