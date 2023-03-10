import {
  Entity,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  ManyToOne,
} from "typeorm"
import { MintTicketMetadata } from "../types/Metadata"
import { GenerativeToken } from "./GenerativeToken"
import { MediaImage } from "./MediaImage"
import { Field, ObjectType } from "type-graphql"
import { GraphQLJSONObject } from "graphql-type-json"

@Entity()
@ObjectType({
  description: "The mint ticket settings for a given collection",
})
export class MintTicketSettings extends BaseEntity {
  @PrimaryColumn()
  tokenId: number

  @OneToOne(() => GenerativeToken, token => token.mintTicketSettings)
  @JoinColumn()
  token: GenerativeToken

  @Field({
    description:
      "The number of days after a mint ticket is created before tax is applied to it",
  })
  @Column()
  gracingPeriod: number

  @Field(() => GraphQLJSONObject, {
    description:
      "The JSON metadata of the Mint Ticket Settings, loaded from the ipfs uri associated with the settings when published",
  })
  @Column({ type: "json" })
  metadata: MintTicketMetadata

  @Field({
    description:
      "IPFS uri pointing to the JSON metadata of the Mint Ticket Settings",
  })
  @Column()
  metadataUri?: string

  @ManyToOne(() => MediaImage)
  @JoinColumn({ name: "captureMediaId", referencedColumnName: "cid" })
  captureMedia?: MediaImage
}
