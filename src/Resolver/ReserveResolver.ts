import { EReserveMethod, Reserve } from "../Entity/Reserve"
import { FieldResolver, Resolver, Root } from "type-graphql"
import { mapReserveMethodIdToEnum } from "../Utils/Reserve"

@Resolver(Reserve)
export class ReserveResolver {
  @FieldResolver(() => EReserveMethod, {
    description: "The reserve method defines the type of the reserve."
  })
  method(
    @Root() reserve: Reserve
  ) {
    return mapReserveMethodIdToEnum(reserve.method)
  }
}