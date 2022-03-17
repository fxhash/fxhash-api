import { ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, Index, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { GenerativeToken } from "./GenerativeToken"
import { Objkt } from "./Objkt"


export enum ETransationType {
  PRIMARY       = "PRIMARY",
  SECONDARY     = "SECONDARY",
}

/**
 * Represents a transaction (either on the primary or secondary market)
 * Makes computations easier
 */
@Entity()
@ObjectType()
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  opHash: string

  @Column({ type: "timestamptz" })
  createdAt: Date

  @Index()
  @Column({
    type: "enum",
    enum: ETransationType,
  })
  type: ETransationType

  @Column({ type: "bigint" })
  price: string

  @ManyToOne(() => GenerativeToken, token => token.transactions)
  token: GenerativeToken

  @Index()
  @Column()
  tokenId: number
  
  @ManyToOne(() => Objkt, objkt => objkt.transactions)
  objkt: Objkt
  
  @Index()
  @Column()
  objktId: number
}