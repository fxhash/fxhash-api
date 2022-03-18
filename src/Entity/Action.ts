import { GraphQLJSONObject } from 'graphql-type-json'
import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Filter, generateFilterType } from 'type-graphql-filter'
import { Entity, Column, BaseEntity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm'
import { HistoryMetadata } from '../types/Metadata'
import { GenerativeToken } from './GenerativeToken'
import { Objkt } from './Objkt'
import { DateTransformer } from './Transformers/DateTransformer'
import { User } from './User'


export enum TokenActionType {
  NONE                          = "NONE",
  UPDATE_STATE                  = "UPDATE_STATE",
  UPDATE_PRICING                = "UPDATE_PRICING",
  BURN_SUPPLY                   = "BURN_SUPPLY",
  MINTED                        = "MINTED",
  MINTED_FROM                   = "MINTED_FROM",
  GENTK_SIGNED                  = "GENTK_SIGNED",
  COMPLETED                     = "COMPLETED",
  TRANSFERED                    = "TRANSFERED",
  LISTING_V1                    = "LISTING_V1",
  LISTING_V1_CANCELLED          = "LISTING_V1_CANCELLED",
  LISTING_V1_ACCEPTED           = "LISTING_V1_ACCEPTED",
  LISTING_V2                    = "LISTING_V2",
  LISTING_V2_CANCELLED          = "LISTING_V2_CANCELLED",
  LISTING_V2_ACCEPTED           = "LISTING_V2_ACCEPTED",
  OFFER                         = "OFFER",
  OFFER_CANCELLED               = "OFFER_CANCELLED",
  OFFER_ACCEPTED                = "OFFER_ACCEPTED",
  COLLECTION_OFFER              = "COLLECTION_OFFER",
  COLLECTION_OFFER_CANCELLED    = "COLLECTION_OFFER_CANCELLED",
  COLLECTION_OFFER_ACCEPTED     = "COLLECTION_OFFER_ACCEPTED",
  AUCTION                       = "AUCTION",
  AUCTION_BID                   = "AUCTION_BID",
  AUCTION_CANCELLED             = "AUCTION_CANCELLED",  
  AUCTION_FULFILLED             = "AUCTION_FULFILLED",    
}
registerEnumType(TokenActionType, {
  name: "ActionType",
  description: "The type of the action",
})

@Entity()
@ObjectType()
export class Action extends BaseEntity {
  @Field({
    description: "A random ID associated with the action during the indexing process."
  })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Field(() => TokenActionType, {
    description: "The type of the action. Different action types will have different fields populated."
  })
  @Column({
    type: "enum",
    enum: TokenActionType,
    default: TokenActionType.NONE
  })
  @Filter(["in", "eq"], () => TokenActionType)
  type: TokenActionType

  @ManyToOne(() => User, user => user.actionsAsIssuer)
  issuer?: User

  @Column()
	issuerId: number

  @ManyToOne(() => User, user => user.actionsAsTarget)
  target?: User

  @Column()
	targetId: number

  @ManyToOne(() => GenerativeToken, token => token.actions)
  token?: GenerativeToken

  @Column()
	tokenId: number

  @ManyToOne(() => Objkt, token => token.actions)
  objkt?: Objkt

  @Column()
	objktId: number

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: "jsonb", nullable: true })
  metadata: HistoryMetadata

  @Field({
    nullable: true,
    description: "A numeric value associated with the action. Sometimes this numeric value can also be found in the metadata, but it's easier to store it to perform operations directly on the field in the DB. Not all the actions have a direct numericValue associated with them."
  })
  @Column({ type: "bigint", nullable: true })
  numericValue: number

  @Field({
    description: "The time at which the action was registered on the blockchain, ie the time of the block when the operation was registered."
  })
  @Column({ type: 'timestamptz', transformer: DateTransformer })
  createdAt: string

  @Field({
    description: "The operation hash corresponding to the action."
  })
  @Column()
  opHash: string
}

// the filters for the Action entity
export const FiltersAction = generateFilterType(Action)