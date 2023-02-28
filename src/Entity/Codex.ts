import { Field, ObjectType } from "type-graphql"
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { GenerativeToken } from "./GenerativeToken"
import { User } from "./User"

export enum CodexType {
  OFF_CHAIN = "OFF_CHAIN",
  ON_CHAIN = "ON_CHAIN",
}

@Entity()
@ObjectType()
export class Codex extends BaseEntity {
  @PrimaryColumn()
  id: number

  @Column({
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
  })
  tokenVersion: GenerativeTokenVersion

  @OneToOne(() => GenerativeToken, token => token.codex, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  token: GenerativeToken

  @Field({
    description: "The type of Codex.",
  })
  @Column({
    type: "enum",
    enum: CodexType,
  })
  type: CodexType

  @Field(type => String, {
    description:
      "The content of the Codex - either an IPFS link to the code or a string containing the actual code.",
    nullable: true,
  })
  @Column({ type: "text", nullable: true })
  value: string | null

  @Column()
  authorId: string

  @ManyToOne(() => User, user => user.codexEntries)
  author: User

  @Field({
    description: "Whether the Codex is locked or not.",
  })
  @Column()
  locked: boolean
}
