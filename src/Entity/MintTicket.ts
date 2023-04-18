import { Field, Float, ObjectType } from "type-graphql"
import { Filter, generateFilterType } from "type-graphql-filter"
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
} from "typeorm"
import { GenerativeToken } from "./GenerativeToken"
import { User } from "./User"
import { Action } from "./Action"

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

  @ManyToOne(() => GenerativeToken, token => token.mintTickets)
  @Filter(["eq"], () => Float)
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

  @Field({
    description: "The date until which the taxation is covered",
  })
  @Column()
  @Filter(["gt", "lt"])
  taxationPaidUntil: Date
}

// the Type for the filters of the GraphQL query for MintTicket
export const FiltersMintTicket = generateFilterType(MintTicket)
