import { Field, ObjectType, registerEnumType } from "type-graphql"
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { Objkt } from "./Objkt"

export enum AssignationState {
  TO_BE_ASSIGNED = "TO_BE_ASSIGNED",
  ASSIGNED = "ASSIGNED",
}
registerEnumType(AssignationState, {
  name: "AssignationState",
  description: "Gentk metadata assignation state",
})

@Entity()
@ObjectType({
  description: "Describes the assignation status of a Gentk.",
})
export class GentkAssign extends BaseEntity {
  @Column({ primary: true })
  gentkId: number

  @Column({
    primary: true,
    type: "enum",
    enum: GenerativeTokenVersion,
  })
  gentkIssuerVersion: GenerativeTokenVersion

  @OneToOne(() => Objkt)
  @JoinColumn()
  gentk: Objkt

  @Field({
    description: "The current assignation state.",
  })
  @Column({
    type: "enum",
    enum: AssignationState,
    default: AssignationState.TO_BE_ASSIGNED,
  })
  state: AssignationState

  @Field({
    description:
      "The number of time the Signer attempter to generate/assign the gentk metadata",
  })
  @Column({ default: 0 })
  attempts: number

  @Field({
    description: "When the signer received the gentk for its assignation",
  })
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: string

  @Field({
    nullable: true,
    description: "When the signer tagger this gentk as properly assigned",
  })
  @Column({ type: "timestamptz", nullable: true })
  assignedAt: string
}
