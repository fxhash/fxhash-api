import { Field, ObjectType } from 'type-graphql'
import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity, CreateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn, RelationId } from 'typeorm'
import { Objkt } from './Objkt'
import { User } from './User'

@Entity()
@ObjectType()
export class Offer extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: number

  @ManyToOne(() => User, user => user.offers)
  issuer: User

  @RelationId((offer: Offer) => offer.issuer)
	issuerId: number

  @OneToOne(() => Objkt)
  @JoinColumn()
  objkt: Objkt

  @RelationId((offer: Offer) => offer.objkt)
	objktId: number

  @Field()
  @Column({ default: 0 })
  price: number = 0

  @Field()
  @Column({ default: 0 })
  royalties: number = 0

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date
}