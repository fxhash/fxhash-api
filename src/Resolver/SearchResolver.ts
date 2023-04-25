import { Arg, Ctx, Field, ObjectType, Query, Resolver } from "type-graphql"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { User } from "../Entity/User"
import { generativeQueryFilter } from "../Query/Filters/GenerativeToken"
import { userQueryFilter } from "../Query/Filters/User"
import { SearchFilters } from "./Arguments/Filter"

@ObjectType()
class SearchResult {
  @Field(() => [User], {
    description: "A list of users who match the query string"
  })
  users: User[]

  @Field(() => [GenerativeToken], {
    description: "A list of projects which match the query string"
  })
  generativeTokens: GenerativeToken[]
}

@Resolver()
export class SearchResolver {
  @Query(returns => SearchResult)
  async search(
		@Arg("filters") filters: SearchFilters,
  ) {
    // first we run the search on the Generative Tokens
    let tokensQuery = GenerativeToken.createQueryBuilder("token").select()
		// apply the filters/sort
		tokensQuery = await generativeQueryFilter(
			tokensQuery,
			filters,
      {
        relevance: "DESC"
      }
		)

    // then we run the search on the users
    let usersQuery = User.createQueryBuilder("user").select()
    // apply the search filters
    usersQuery = await userQueryFilter(
      usersQuery,
      filters,
      {
        relevance: "DESC"
      }
    )

    // return response with a DB search
    return {
      users: await usersQuery.getMany(),
      generativeTokens: await tokensQuery.getMany(),
    }
  }
}