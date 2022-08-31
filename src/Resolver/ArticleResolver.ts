import { ApolloError } from "apollo-server-express";
import { Arg, Args, Ctx, FieldResolver, Int, Query, Resolver, Root } from "type-graphql"
import { Action, FiltersAction } from "../Entity/Action";
import { Article, ArticleFilters } from "../Entity/Article";
import { ArticleGenerativeToken } from "../Entity/ArticleGenerativeToken";
import { ArticleLedger } from "../Entity/ArticleLedger";
import { ArticleRevision } from "../Entity/ArticleRevision";
import { Split } from "../Entity/Split";
import { User } from "../Entity/User";
import { articleQueryFilter } from "../Query/Filters/Article";
import { RequestContext } from "../types/RequestContext";
import { processFilters } from "../Utils/Filters";
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination";
import { ActionsSortInput, ArticleSortInput, defaultSort } from "./Arguments/Sort";

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

		let query = Article.createQueryBuilder("article").select()

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

  @FieldResolver(() => User, {
    description: "The author of the article"
  })
  author(
    @Root() article: Article,
    @Ctx() ctx: RequestContext,
  ) {
    return ctx.usersLoader.load(article.authorId)
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

  @FieldResolver(() => [ArticleGenerativeToken], {
		description: "The Generative Tokens mentionned by the article."
	})
	generativeTokenMentions(
		@Root() article: Article,
    @Ctx() ctx: RequestContext,
	) {
		return ctx.articlesGenTokMentionsLoader.load(article.id)
	}

  @FieldResolver(() => [ArticleRevision], {
    description: "A list of the revisions made to the article."
  })
  revisions(
    @Root() article: Article,
    @Ctx() ctx: RequestContext,
  ) {
    return ctx.articlesRevisionsLoader.load(article.id)
  }

  @FieldResolver(() => [Split], {
    description: "The royalty splits."
  })
  royaltiesSplits(
    @Root() article: Article,
    @Ctx() ctx: RequestContext,
  ) {
    return ctx.articlesRoyaltiesSplitsLoader.load(article.id)
  }

  @FieldResolver(returns => [Action], {
		description: "A list of all the actions related to the Article. **Not optimized to be run on multiple generative tokens at once, please use carefully*.",
	})
	actions(
		@Root() article: Article,
		@Arg("filters", FiltersAction, { nullable: true}) filters: any,
		@Arg("sort", { nullable: true }) sortArgs: ActionsSortInput,
		@Args() { skip, take }: PaginationArgs,
	): Promise<Action[]> {
		// default arguments
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		sortArgs = defaultSort(sortArgs, {
			createdAt: "DESC"
		})
	
		// create the query
		let query = Action.createQueryBuilder("action").select()

		// add the generic filters
		query.where(processFilters(filters))

		// add the filters to target the article only
		query.andWhere("action.articleId = :id", { id: article.id })

		// add the sort arguments
		for (const sort in sortArgs) {
			query.addOrderBy(`action.${sort}`, sortArgs[sort])
		}

		// add pagination
		query.skip(skip)
		query.take(take)

		return query.getMany()
	}

	@FieldResolver(() => [Article])
	async relatedArticles(
		@Root() article: Article,
		@Args() { skip, take }: PaginationArgs,
	) {
		// default arguments
		[skip, take] = useDefaultValues([skip, take], [0, 5])

		// sort by search relevance
		const sort: ArticleSortInput = {
			relevance: "DESC"
		}

		// create the select query & the filters
		let query = Article.createQueryBuilder("article").select()

		// apply the filters/sort
		query = await articleQueryFilter(
			query,
			{
				searchQuery_eq: article.tags.join(" ")
			},
			sort,
		)

		// we remove the current article from related
		query.andWhere("article.id != :id", { id: article.id })

		// add pagination
		query.take(take)
		query.skip(skip)

		return query.getMany()
	}

	@FieldResolver(returns => String, {
		nullable: true,
		description: "If any, returns the moderation reason associated with the Article",
	})
	async moderationReason(
		@Root() article: Article,
		@Ctx() ctx: RequestContext,
	) {
		if (article.moderationReasonId == null) return null
		if (article.moderationReason) return article.moderationReason
		return ctx.moderationReasonsLoader.load(article.moderationReasonId)
	}
}