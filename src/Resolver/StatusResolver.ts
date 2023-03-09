import { Arg, Field, Int, ObjectType, Query, Resolver } from "type-graphql"
import { AssignationState, GentkAssign } from "../Entity/GentkAssign"
import { IndexingCursor } from "../Entity/IndexingCursor"
import { ObjktId } from "../Scalar/ObjktId"

@ObjectType({
  description: "An abstraction to query different status metrics.",
})
class Status {}

@ObjectType({
  description: "Represents the status of the assignation module.",
})
class StatusAssignation {
  @Field(is => Int, {
    description:
      "The number of gentks in the queue to have their metadata assigned by the signing module.",
  })
  queueSize: number

  @Field(is => Date, {
    nullable: true,
    description: "The time when the last gentk was assigned.",
  })
  lastAssignedAt?: string | null
}

@Resolver(Status)
export class StatusResolver {
  @Query(returns => GentkAssign, {
    nullable: true,
    description:
      "Get the assignation status of a particular gentk, identified by its ID.",
  })
  statusGentkAssignation(@Arg("id") { id, issuerVersion }: ObjktId) {
    return GentkAssign.findOne({
      gentkId: id,
      gentkIssuerVersion: issuerVersion,
    })
  }

  @Query(returns => StatusAssignation, {
    description:
      "Returns the current assignation status with different metrics",
  })
  async statusAssignation(): Promise<StatusAssignation> {
    // find the size of the queue
    const queueSize = await GentkAssign.createQueryBuilder("assign")
      .select()
      .where({
        state: AssignationState.TO_BE_ASSIGNED,
      })
      .getCount()

    // find the time at which the last gentk was assigned
    const lastAssigned = await GentkAssign.createQueryBuilder("assign")
      .select()
      .where(`assign.state = '${AssignationState.ASSIGNED}'`)
      .orderBy("assign.assignedAt", "DESC", "NULLS LAST")
      .limit(1)
      .getOne()

    return {
      queueSize,
      lastAssignedAt: lastAssigned?.assignedAt,
    }
  }

  @Query(returns => IndexingCursor, {
    description: "The status of the indexer",
  })
  statusIndexing() {
    return IndexingCursor.findOne("core")
  }
}
