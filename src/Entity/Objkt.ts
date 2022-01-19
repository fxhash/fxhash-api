import { GraphQLJSONObject } from 'graphql-type-json'
import slugify from 'slugify'
import { createUnionType, Field, Int, ObjectType, registerEnumType } from 'type-graphql'
import { generateFilterType, Filter } from 'type-graphql-filter'
import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity, CreateDateColumn, ManyToOne, OneToOne, OneToMany, RelationId } from 'typeorm'
import { GenMintProgressFilter } from '../types/GenerativeToken'
import { ObjktMetadata, TokenFeature, TokenFeatureValueType, TokenMetadata } from '../types/Metadata'
import { Action } from './Action'
import { GenerativeToken } from './GenerativeToken'
import { Offer } from './Offer'
import { DateTransformer } from './Transformers/DateTransformer'
import { User } from './User'


@Entity()
@ObjectType()
export class Objkt extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  slug?: string

  @ManyToOne(() => GenerativeToken, token => token.objkts)
  @Filter([ "in" ], type => Int)
  issuer?: GenerativeToken

  @Column({ nullable: false })
	issuerId: number

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.objkts)
  owner?: User|null

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Filter(["eq"], type => Boolean)
  assigned?: boolean

  @Field({ nullable: true })
  @Column({ nullable: true })
  iteration?: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  generationHash?: string
  
  @Field({ nullable: true })
  @Column({ nullable: true })
  duplicate: boolean

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: "json", nullable: true })
  metadata?: ObjktMetadata

  @Field({ nullable: true })
  @Column({ nullable: true })
  metadataUri: string

  @Field(() => [String],{ nullable: true })
  @Column("text", { nullable: true, array: true })
  tags: string[]

  @Field(() => [GraphQLJSONObject], { nullable: true })
  @Column({ type: "json", nullable: true })
  features?: TokenFeature[]

  @Field(() => Number, { nullable: true })
  @Column({ type: "double precision", nullable: true })
  rarity?: number

  @Field()
  @Column({ default: 0 })
  royalties: number = 0

  @OneToOne(() => Offer, offer => offer.objkt, { onDelete: "CASCADE" })
  @Filter(["ne"])
  offer?: Offer|null

  @OneToMany(() => Action, action => action.objkt)
  actions: Action[]

  @Field()
  @CreateDateColumn({ type: 'timestamptz', transformer: DateTransformer })
  @Filter(["lt", "gt"])
  createdAt: string

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', nullable: true, transformer: DateTransformer })
  updatedAt: string

  @Field({ nullable: true })
  @Column({ type: "timestamptz", transformer: DateTransformer })
  @Filter(["gt", "lt"])
  assignedAt: string


  //
  // FILTERS FOR THE GQL ENDPOINT
  //

  @Filter([ "eq" ], type => GenMintProgressFilter)
  mintProgress: "completed"|"ongoing"|"almost"

  @Filter([ "eq" ], type => Boolean)
  authorVerified: Boolean

  @Filter([ "in" ], type => String)
  author: string[]

  @Filter([ "eq" ], type => String)
  searchQuery: string
}

// the Type for the filters of the GraphQL query for Objkt
export const FiltersObjkt = generateFilterType(Objkt)