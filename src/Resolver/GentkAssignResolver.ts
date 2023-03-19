import { FieldResolver, Resolver, Root } from "type-graphql"
import { GentkAssign } from "../Entity/GentkAssign"
import { ObjktId } from "../Scalar/ObjktId"

@Resolver(GentkAssign)
export class GentkAssignResolver {
  @FieldResolver(returns => ObjktId)
  gentkId(@Root() gentkAssign: GentkAssign) {
    return new ObjktId({
      id: gentkAssign.gentkId,
      issuerVersion: gentkAssign.gentkIssuerVersion,
    })
  }
}
