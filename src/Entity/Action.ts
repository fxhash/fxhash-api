import { GraphQLObjectType } from 'graphql'
import { GraphQLJSONObject } from 'graphql-type-json'
import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Filter, generateFilterType } from 'type-graphql-filter'
import { Entity, Column, BaseEntity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm'
import { HistoryMetadata } from '../types/Metadata'
import { GenerativeToken } from './GenerativeToken'
import { Objkt } from './Objkt'
import { User } from './User'


export enum TokenActionType {
  NONE              = "NONE",
  UPDATE_STATE      = "UPDATE_STATE",
  MINTED            = "MINTED",
  MINTED_FROM       = "MINTED_FROM",
  COMPLETED         = "COMPLETED",
  TRANSFERED        = "TRANSFERED",
  OFFER             = "OFFER",
  OFFER_CANCELLED   = "OFFER_CANCELLED",
  OFFER_ACCEPTED    = "OFFER_ACCEPTED"
}

registerEnumType(TokenActionType, {
  name: "TokenActionType", // this one is mandatory
  description: "The type of the action", // this one is optional
});

@Entity()
@ObjectType()
export class Action extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Field(() => TokenActionType)
  @Column({
    type: "enum",
    enum: TokenActionType,
    default: TokenActionType.NONE
  })
  @Filter(["in", "eq"])
  type: TokenActionType

  @ManyToOne(() => User, user => user.actionsAsIssuer)
  issuer?: User

  @RelationId((action: Action) => action.issuer)
	issuerId: number

  @ManyToOne(() => User, user => user.actionsAsTarget)
  target?: User

  @RelationId((action: Action) => action.target)
	targetId: number

  @ManyToOne(() => GenerativeToken, token => token.actions, { onDelete: "CASCADE" })
  token?: GenerativeToken

  @RelationId((action: Action) => action.token)
	tokenId: number

  @ManyToOne(() => Objkt, token => token.actions)
  objkt?: Objkt

  @RelationId((action: Action) => action.objkt)
	objktId: number

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: "json", nullable: true })
  metadata: HistoryMetadata

  @Field()
  @Column({ type: 'timestamptz' })
  createdAt: Date
}

// the filters for the Action entity
export const FiltersAction = generateFilterType(Action)