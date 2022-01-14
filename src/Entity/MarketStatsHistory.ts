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

  @Index()
  @Column()
  tokenId: number

  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  floor: number|null
  
  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  median: number|null
  
  @Field(type => Number, { nullable: true })
  @Column({ type: "int", nullable: true })
  listed: number|null
  
  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  highestSold: number|null
  
  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  lowestSold: number|null
  
  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  primVolumeTz: number|null
  
  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
  primVolumeNb: number|null
  
  // the volume (tezos) on the covered period
  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
	secVolumeTz: number|null
  
  // the volume (number) on the covered period
  @Field(type => Number, { nullable: true })
  @Column({ type: "bigint", nullable: true })
	secVolumeNb: number|null
  
  // [from; to] defines the range covered by those stats
  
  @Field({ nullable: true })
  @UpdateDateColumn({ type: "timestamptz" })
  from: Date
  
  @Field({ nullable: true })
  @UpdateDateColumn({ type: "timestamptz" })
  to: Date
}