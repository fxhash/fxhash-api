import GraphQLJSON from "graphql-type-json"
import { Field, Int, ObjectType, registerEnumType } from "type-graphql"
import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { GenerativeToken } from "./GenerativeToken"


export enum EReserveMethod {
  WHITELIST         = "WHITELIST",
  TOKEN_STAKERS     = "TOKEN_STAKERS",
}
registerEnumType(EReserveMethod, {
  name: "ReserveMethod",
  description: "The type of the reserve, describes what it does."
})

@Entity()
@ObjectType({
  description: "Describes the reserves of a Generative Token. Reserves can be used by artists to control the distribution of the tokens more carefully."
})
export class Reserve extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @ManyToOne(() => GenerativeToken, token => token.reserves)
  token: GenerativeToken

  @Column()
  tokenId: number

  @Field(() => GraphQLJSON, {
    description: "A json object which describes the content of the reserve as stored on the blockhain. It should be noted that this data is not stored with relationship with other entities for query efficiency."
  })
  @Column({ type: "jsonb", nullable: true })
  data: any

  @Column()
  method: number

  @Field(() => Int, {
    description: "The amount of iterations controlled by the reserve. When reaching 0, the reserve is not active anymore. If someone mints an iteration from the reserve, this counter will decrement."
  })
  @Column()
  amount: number
}