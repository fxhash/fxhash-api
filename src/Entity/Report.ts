import { Field, ObjectType } from "type-graphql"
import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { GenerativeToken } from "./GenerativeToken"
import { ModerationReason } from "./ModerationReason"
import { DateTransformer } from "./Transformers/DateTransformer"
import { User } from "./User"

@Entity()
@ObjectType({
  description:
    "Any fxhash user can report any Generative Token, and such report is represented by this entity.",
})
export class Report extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => User, user => user.reports)
  user?: User

  @Column()
  userId: number

  @ManyToOne(() => GenerativeToken, token => token.actions)
  token?: GenerativeToken

  @Column({
    type: "enum",
    enum: GenerativeTokenVersion,
  })
  tokenVersion: GenerativeTokenVersion

  @Column()
  tokenId: number

  @ManyToOne(() => ModerationReason, reason => reason.reports, {
    onDelete: "CASCADE",
    nullable: true,
  })
  reason?: ModerationReason | null

  @Field()
  @Column({ type: "timestamptz", transformer: DateTransformer })
  createdAt: string
}
