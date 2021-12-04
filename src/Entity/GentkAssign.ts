import { GraphQLObjectType } from 'graphql'
import { GraphQLJSONObject } from 'graphql-type-json'
import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Entity, Column, BaseEntity, ManyToOne, PrimaryGeneratedColumn, RelationId, PrimaryColumn, CreateDateColumn } from 'typeorm'
import { HistoryMetadata } from '../types/Metadata'
import { GenerativeToken } from './GenerativeToken'
import { Objkt } from './Objkt'
import { User } from './User'


export enum AssignationState {
  TO_BE_ASSIGNED    = "TO_BE_ASSIGNED",
  ASSIGNED          = "ASSIGNED"
}

registerEnumType(AssignationState, {
  name: "AssignationState", // this one is mandatory
  description: "Gentk metadata assignation state", // this one is optional
});

@Entity()
export class GentkAssign extends BaseEntity {
  @PrimaryColumn()
  id: number

  @Column({
    type: "enum",
    enum: AssignationState,
    default: AssignationState.TO_BE_ASSIGNED
  })
  state: AssignationState

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string

  @Column({ type: 'timestamptz', nullable: true })
  assignedAt: string

  static async findOrCreate(id: number): Promise<GentkAssign> {
    let gentk = await GentkAssign.findOne(id)
    if (!gentk) {
      gentk = GentkAssign.create({ id, state: AssignationState.TO_BE_ASSIGNED })
    }
    return gentk
  }

  async assigned() {
    this.state = AssignationState.ASSIGNED
    this.assignedAt = (new Date()).toISOString()
    await this.save()
  }
}