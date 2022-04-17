import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from "typeorm"
import { User } from "./User"

/**
 * The collaboration entity can be seen as an abstraction of a collaboration
 * between multiple users. To optimize the database, this table is simply a
 * join table in a ManyToMany relationship between users (as a collaboration
 * contract) and users (as collaborators).
 */
@Entity()
export class Collaboration extends BaseEntity {
  @PrimaryColumn()
  collaborationContractId: string

  @ManyToOne(() => User, user => user.collaborationContracts)
  collaborationContract: string

  @PrimaryColumn()
  collaboratorId: string

  @ManyToOne(() => User, user => user.collaborators)
  collaborator: User
}