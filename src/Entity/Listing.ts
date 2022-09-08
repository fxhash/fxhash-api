import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Filter, generateFilterType } from 'type-graphql-filter'
import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne, Index } from 'typeorm'
import { Article } from './Article'
import { Objkt } from './Objkt'
import { User } from './User'


// enum used to filter the listing
export enum EListingAssetType {
  GENTK = "GENTK",
  ARTICLE = "ARTICLE"
}
registerEnumType(EListingAssetType, {
  name: "ListingAssetType",
  description: "The type of asset listed.",
})

@Entity()
@ObjectType({
  description: "A Listing on the fxhash secondary market. A polymorphic entity which encapsulates both the listings made on V1 and V2 marketplace contracts."
})
export class Listing extends BaseEntity {
  @Field({
    description: "The ID of the listing, corresponds to the ID on the blockchain."
  })
  @PrimaryColumn()
  id: number

  @Field({
    description: "Both listings from the marketplace V1 and V2 contracts are stored in a similar fashion, however this field indicates to which contract the listing belongs. (0 = old marketplace, 1 = new marketplace)"
  })
  @PrimaryColumn()
  version: number

  @Index()
  @ManyToOne(() => User, user => user.listings)
  issuer: User

  @Column()
  issuerId: string

  @ManyToOne(() => Objkt, objkt => objkt.listings)
  objkt: Objkt
  
  @Column()
  objktId: number
  
  @ManyToOne(() => Article, article => article.listings)
  article?: Article
  
  @Column()
  articleId: number

  @Field({
    description: "The amount of the asset in the listing. For NFTs it will always be 1."
  })
  @Column({ type: "bigint" })
  amount: number 

  @Field({
    description: "The listing price, **in mutez**"
  })
  @Column({ type: "bigint", default: 0 })
  @Filter([ "gte", "lte" ], type => String)
  price: number = 0

  @Field({
    description: "The royalties which will be sent to the secondary splits when a sale occurs, per thousands (divide by 10 to get percentage)"
  })
  @Column({ default: 0 })
  royalties: number = 0

  @Field({
    description: "When the listing was created by the user",
  })
  @Column({ type: "timestamptz" })
  @Filter([ "gte", "lte" ], type => Date)
  createdAt: Date
  
  @Field({
    nullable: true,
    description: "When the listing was cancelled by the seller (if null, listing was never cancelled)",
  })
  @Column({ type: "timestamptz", nullable: true })
  @Filter([ "gte", "lte" ], type => Date)
  @Filter([ "exist" ], type => Boolean)
  cancelledAt: Date
  
  @Field({
    nullable: true,
    description: "When the listing was accepted by the buyer (if null, listing was never accepted)",
  })
  @Column({ type: "timestamptz", nullable: true })
  @Filter([ "gte", "lte" ], type => Date)
  @Filter([ "exist" ], type => Boolean)
  acceptedAt: Date

  
  //
  // FILTERS FOR THE GQL ENDPOINT
  //

  @Filter([ "eq" ], type => Boolean)
  fullyMinted: boolean

  @Filter([ "gte", "lte" ], type => Number)
  tokenSupply: number

  @Filter([ "eq" ], type => Boolean)
  authorVerified: Boolean

  @Filter([ "eq" ], type => String)
  searchQuery: string

  @Filter(["eq"], type => EListingAssetType)
  asset: EListingAssetType
}

export const FiltersListing = generateFilterType(Listing)