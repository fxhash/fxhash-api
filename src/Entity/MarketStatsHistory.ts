import { Field, ObjectType } from 'type-graphql'
import { Entity, Column, UpdateDateColumn, BaseEntity, ManyToOne, Index, PrimaryGeneratedColumn } from 'typeorm'
import { GenerativeToken } from './GenerativeToken'

@ObjectType()
@Entity()
export class MarketStatsHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => GenerativeToken, token => token.marketStatsHistory, { onDelete: "CASCADE" })
  token: GenerativeToken

  @Column()
  tokenId: number

  @Field(type => Number, { nullable: true, description: "The floor of the collection at the end of the range covered" })
  @Column({ type: "bigint", nullable: true })
  floor: number|null
  
  @Field(type => Number, { nullable: true, description: "The median of the collection at the end of the range covered" })
  @Column({ type: "bigint", nullable: true })
  median: number|null
  
  @Field(type => Number, { nullable: true, description: "The number of items listed at the end of the range covered" })
  @Column({ type: "int", nullable: true })
  listed: number|null
  
  @Field(type => Number, { nullable: true, description: "The highest sale value for an item from the beginning of the collection to the end of the range covered" })
  @Column({ type: "bigint", nullable: true })
  highestSold: number|null
  
  @Field(type => Number, { nullable: true, description: "The lowest sale value for an item from the beginning of the collection to the end of the range covered" })
  @Column({ type: "bigint", nullable: true })
  lowestSold: number|null
  
  @Field(type => Number, { nullable: true, description: "The volume (in tezos) of sales on the primary market during the range covered" })
  @Column({ type: "bigint", nullable: true })
  primVolumeTz: number|null
  
  @Field(type => Number, { nullable: true, description: "The volume (in number) of sales on the primary during the range covered" })
  @Column({ type: "bigint", nullable: true })
  primVolumeNb: number|null
  
  // the volume (tezos) on the covered period
  @Field(type => Number, { nullable: true, description: "The volume (in tezos) of sales on the secondary market during the range covered" })
  @Column({ type: "bigint", nullable: true })
	secVolumeTz: number|null
  
  // the volume (number) on the covered period
  @Field(type => Number, { nullable: true, description: "The volume (in number) of sales on the secondary market during the range covered" })
  @Column({ type: "bigint", nullable: true })
	secVolumeNb: number|null
  
  // [from; to] defines the range covered by those stats
  
  @Field({ nullable: true, description: "The beginning of the range (inclusive) covering those stats [from; to[" })
  @UpdateDateColumn({ type: "timestamptz" })
  from: Date
  
  @Field({ nullable: true, description: "The end of the range (exclusive) covering those stats [from; to[" })
  @UpdateDateColumn({ type: "timestamptz" })
  to: Date
}