import { GraphQLJSONObject } from 'graphql-type-json'
import slugify from 'slugify'
import { createUnionType, Field, ObjectType } from 'type-graphql'
import { generateFilterType, Filter } from 'type-graphql-filter'
import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity, CreateDateColumn, ManyToOne, OneToOne, OneToMany, RelationId } from 'typeorm'
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
  issuer?: GenerativeToken

  @RelationId((obj: Objkt) => obj.issuer)
	issuerId: number

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.objkts)
  owner?: User|null

  @RelationId((obj: Objkt) => obj.owner)
	ownerId: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Filter(["eq"])
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

  @RelationId((obj: Objkt) => obj.offer)
	offerId: number

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

  static async findOrCreate(id: number, createdAt: string): Promise<Objkt> {
    let objkt = await Objkt.findOne(id, { relations: [ "owner", "issuer" ]})
    if (!objkt) {
      objkt = Objkt.create({ id, createdAt })
    }
    return objkt
  }

  /**
   * Given a name, sets the slug on the entity (ensures that no other entity has the same slug)
   */
   async setSlugFromName(name: string) {
    let appendix: number|null = null
    while(true) {
      let slug = slugify(`${name} ${appendix!==null?appendix:""}`, {
        lower: true
      })

      // do we have an Entity with this slug already ?
      const found = await Objkt.findOne({
        where: {
          slug
        }
      })
      if (found) {
        appendix = appendix === null ? 1 : appendix+1
        continue
      }
      else {
        this.slug = slug
        break
      }
    }
  }
}

// the Type for the filters of the GraphQL query for Objkt
export const FiltersObjkt = generateFilterType(Objkt)