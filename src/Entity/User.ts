import { GraphQLString } from 'graphql'
import { GraphQLJSONObject } from 'graphql-type-json'
import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Entity, Column, PrimaryColumn, BaseEntity, OneToMany } from 'typeorm'
import { Action } from './Action'
import { GenerativeToken } from './GenerativeToken'
import { Objkt } from './Objkt'
import { Offer } from './Offer'
import { Report } from './Report'


export enum UserRole {
  USER              = "USER",
  MODERATOR         = "MODERATOR",
  ADMIN             = "ADMIN",
}

registerEnumType(UserRole, {
  name: "UserRole", // this one is mandatory
  description: "Role of the user", // this one is optional
})

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string
 
  @Field(() => UserRole)
  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>

  @Field({ nullable: true })
  @Column({ nullable: true })
  metadataUri: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatarUri: string

  @OneToMany(() => GenerativeToken, token => token.author)
  generativeTokens: GenerativeToken[]

  @OneToMany(() => Action, action => action.issuer)
  actionsAsIssuer: Action[]

  @OneToMany(() => Action, action => action.target)
  actionsAsTarget: Action[]

  @OneToMany(() => Objkt, objkt => objkt.owner)
  objkts: Objkt[]

  @OneToMany(() => Offer, offer => offer.issuer)
  offers: Offer[]

  @OneToMany(() => Report, report => report.user)
  reports: Report[]

  @Field()
  @Column({ type: "timestamptz" })
  createdAt: Date

  @Field()
  @Column({ type: "timestamptz" })
  updatedAt: Date

  static async findOrCreate(id: string, createdAt: string): Promise<User> {
    let user = await User.findOne(id)
    if (!user) {
      user = User.create({ id, createdAt, updatedAt: createdAt })
    }
    return user
  }
}