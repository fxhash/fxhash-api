import { ApolloError } from "apollo-server-errors"
import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Action } from "../Entity/Action"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Objkt } from "../Entity/Objkt"
import { Offer } from "../Entity/Offer"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { PaginationArgs } from "./Arguments/Pagination"

@Resolver(GenerativeToken)
export class GenTokenResolver {
  @FieldResolver(returns => [Objkt])
	objkts(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.objkts) return token.objkts
		return ctx.genTokObjktsLoader.load(token.id)
	}

	@FieldResolver(returns => [Objkt])
	latestObjkts(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.objkts) return token.objkts
		return ctx.genTokLatestObjktsLoader.load(token.id)
	}

  @FieldResolver(returns => User)
	author(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.author) return token.author
		return ctx.usersLoader.load(token.authorId)
	}

	@FieldResolver(returns => [Action])
	actions(
		@Root() token: GenerativeToken,
		@Ctx() ctx: RequestContext
	) {
		if (token.actions) return token.actions
		return ctx.genTokActionsLoader.load(token.id)
	}
  
  @Query(returns => [GenerativeToken])
	generativeTokens(
		@Args() { skip, take }: PaginationArgs
	): Promise<GenerativeToken[]> {
		return GenerativeToken.find({
			order: {
				createdAt: "DESC"
			},
			skip,
			take,
		})
	}

	@Query(returns => GenerativeToken, { nullable: true })
	generativeToken(
		@Arg('id', { nullable: true }) id: number,
		@Arg('slug', { nullable: true }) slug: string,
	): Promise<GenerativeToken|undefined> {
		if (id == null && slug == null) {
			throw new ApolloError("Either ID or SLUG must be supllied.")
		}
		if (id != null) {
			return GenerativeToken.findOne(id)
		}
		else {
			return GenerativeToken.findOne({
				where: { slug }
			})
		}
	}

	@Query(returns => GenerativeToken, { nullable: true })
	async randomGenerativeToken(): Promise<GenerativeToken|undefined> {
		const tok = await GenerativeToken.createQueryBuilder()
			.select("*")
			.from(GenerativeToken, "token")
			.orderBy("RANDOM()")
			.limit(1)
			.execute()
		return tok[0] || null
	}

	@Query(returns => [GenerativeToken])
	async searchGenerativeTokens(
		@Arg('search') search: string
	): Promise<GenerativeToken[]> {
		const formattedQuery = search.trim().replace(/ /g, ' & ');
		const tokens = await GenerativeToken.createQueryBuilder('token')
			.leftJoinAndSelect('token.author', 'auth')
			.where(`to_tsvector(token.name) @@ to_tsquery(:search)`, { search: `${formattedQuery}` })
			.orWhere(`to_tsvector(auth.name) @@ to_tsquery(:search)`, { search: `${formattedQuery}` })
			.getMany()
		return tokens
	}
}