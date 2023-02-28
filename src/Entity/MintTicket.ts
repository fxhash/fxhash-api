import { Field, ObjectType } from "type-graphql"
import { Filter, generateFilterType } from "type-graphql-filter"
import { Entity, Column, BaseEntity, PrimaryColumn, ManyToOne } from "typeorm"
import { GenerativeTokenVersion } from "../types/GenerativeToken"
import { GenerativeToken } from "./GenerativeToken"
import { User } from "./User"

@Entity()
@ObjectType({
  description:
    "A Mint Ticket is a pass that allows a user to mint fx(params) tokens.",
})
export class MintTicket extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: number

  @Column()
  tokenId: number

  @Column({
    type: "enum",
    enum: GenerativeTokenVersion,
    enumName: "generative_token_version",
  })
  tokenVersion: GenerativeTokenVersion

  @ManyToOne(() => GenerativeToken, token => token.mintTickets)
  token: GenerativeToken

  @Column()
  ownerId: string

  @ManyToOne(() => User, user => user.mintTickets)
  @Filter(["eq"], () => String)
  owner: User

  @Field({
    description: "When the ticket was created",
  })
  @Column()
  @Filter(["gt", "lt"])
  createdAt: Date

  @Field({
    description: "Price, in **mutez**",
  })
  @Column({ type: "bigint" })
  @Filter(["gt", "lt"])
  price: number

  @Field({
    description: "The amount of tax locked in the ticket",
  })
  @Column()
  @Filter(["gt", "lt"])
  taxationLocked: string

  @Field({
    description: "When the taxation of the ticket will start",
  })
  @Column()
  @Filter(["gt", "lt"])
  taxationStart: Date
}

// the Type for the filters of the GraphQL query for MintTicket
export const FiltersMintTicket = generateFilterType(MintTicket)