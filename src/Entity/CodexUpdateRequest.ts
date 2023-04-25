import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { Codex } from "./Codex"
import { GenerativeToken } from "./GenerativeToken"

export enum CodexUpdateRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
}

@Entity()
export class CodexUpdateRequest extends BaseEntity {
  @PrimaryColumn()
  tokenId: number

  @Column({
    primary: true,
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
    default: GenerativeTokenVersion.V3,
  })
  tokenVersion: GenerativeTokenVersion

  @Column({ primary: true })
  codexId: number

  @Column({ type: "timestamptz" })
  createdAt: Date

  @Column({
    type: "enum",
    enum: CodexUpdateRequestStatus,
    default: CodexUpdateRequestStatus.PENDING,
  })
  status: CodexUpdateRequestStatus

  @OneToOne(() => GenerativeToken, token => token.codexUpdateRequest, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  token: GenerativeToken

  @OneToOne(() => Codex)
  codex: Codex
}
