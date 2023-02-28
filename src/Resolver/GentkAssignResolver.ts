import { FieldResolver, Resolver, Root } from "type-graphql"
import { GentkAssign } from "../Entity/GentkAssign"
import { TokenId } from "../Scalar/TokenId"

@Resolver(GentkAssign)
export class GentkAssignResolver {
  @FieldResolver(returns => TokenId)
  gentkId(@Root() gentkAssign: GentkAssign) {
    return new TokenId({
      id: gentkAssign.gentkId,
      version: gentkAssign.gentkIssuerVersion,
    })
  }
}
