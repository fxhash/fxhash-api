import { Query, Resolver } from "type-graphql"
import { ModerationReason } from "../Entity/ModerationReason"


@Resolver(ModerationReason)
export class ModerationReasonResolver {
  @Query(() => [ModerationReason], {
    description: "A list of the moderation reasons"
  })
  moderationReasons() {
    return ModerationReason.find()
  }
}