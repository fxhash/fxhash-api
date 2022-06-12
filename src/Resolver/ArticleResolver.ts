import { ApolloError } from "apollo-server-express";
import { Arg, Args, Ctx, FieldResolver, Int, Query, Resolver, Root } from "type-graphql"
import { Article, ArticleFilters } from "../Entity/Article";
import { ArticleLedger } from "../Entity/ArticleLedger";
import { articleQueryFilter } from "../Query/Filters/Article";
import { RequestContext } from "../types/RequestContext";
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination";
import { ArticleSortInput } from "./Arguments/Sort";

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

  @Query(returns => [Article], {
		description: "Generic endpoint to query the Articlres. Requires pagination and provides sort and filter options."
	})
	async articles(
		@Args() { skip, take }: PaginationArgs,
		@Arg("sort", { nullable: true }) sort: ArticleSortInput,
		@Arg("filters", ArticleFilters, { nullable: true }) filters: any
	): Promise<Article[]> {
		// default arguments
		if (!sort || Object.keys(sort).length === 0) {
			sort = {
				createdAt: "DESC"
			}
		}
		[skip, take] = useDefaultValues([skip, take], [0, 20])

		let query = Article.createQueryBuilder("token").select()

		// apply the filters/sort
		query = await articleQueryFilter(
			query,
			filters,
			sort,
		)

		// add pagination
		query.take(take)
		query.skip(skip)

		return query.getMany()
	}

  @FieldResolver(() => [ArticleLedger], {
    description: "The ledger (owners & editions) of the article."
  })
  ledger(
    @Root() article: Article,
    @Ctx() ctx: RequestContext,
  ) {
    return ctx.articlesLedgersLoader.load(article.id)
  }
}