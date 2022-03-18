import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Entity, Column, BaseEntity, PrimaryColumn, CreateDateColumn } from 'typeorm'


export enum AssignationState {
  TO_BE_ASSIGNED    = "TO_BE_ASSIGNED",
  ASSIGNED          = "ASSIGNED"
}
registerEnumType(AssignationState, {
  name: "AssignationState",
  description: "Gentk metadata assignation state",
})

@Entity()
@ObjectType({
  description: "Describes the assignation status of a Gentk."
})
export class GentkAssign extends BaseEntity {
  @Field({
    description: "The gentk ID"
  })
  @PrimaryColumn()
  id: number

  @Field({
    description: "The current assignation state."
  })
  @Column({
    type: "enum",
    enum: AssignationState,
    default: AssignationState.TO_BE_ASSIGNED
  })
  state: AssignationState

  @Field({
    description: "The number of time the Signer attempter to generate/assign the gentk metadata"
  })
  @Column({ default: 0 })
  attempts: number

  @Field({
    description: "When the signer received the gentk for its assignation"
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string

  @Field({
    nullable: true,
    description: "When the signer tagger this gentk as properly assigned"
  })
  @Column({ type: 'timestamptz', nullable: true })
  assignedAt: string
}