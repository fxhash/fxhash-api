import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryColumn } from "typeorm";
import { Article } from "./Article";
import { DateTransformer } from "./Transformers/DateTransformer";


@ObjectType({
  description: "Articles can be revised by their author. Revisions are all stored."
})
@Entity()
export class ArticleRevision extends BaseEntity {
  @Index()
  @ManyToOne(() => Article, article => article.revisions)
  article: Article

  @PrimaryColumn()
  articleId: number

  @Field({
    description: "The revision index, starting at 0. At index 0, it corresponds to the mint version."
  })
  @PrimaryColumn({ type: "smallint" })
  iteration: number

  @Field({
    description: "IPFS uri pointing to the metadata corresponding to the revision (or original version if 0)"
  })
  @Column()
  metadataUri: string

  @Field({
    description: "Datetime at which the revision was published onchain."
  })
  @Column({ type: "timestamptz", transformer: DateTransformer })
  createdAt: string

  @Field({
    description: "Hash of the transaction used to publish the revision onchain."
  })
  @Column()
  opHash: string
}