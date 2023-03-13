import { GraphQLJSONObject } from "graphql-type-json"
import { Field, Int, ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, Index, PrimaryColumn } from "typeorm"

/**
 * The MediaImage entity is used to store media images which have to be
 * processed by a side worker to add details about the image
 * (such as its resolution or a placeholder to improve the front end load time)
 */
@Entity()
@ObjectType({
  description: "The MediaImage object is an abstraction for image elements. To improve the quality and efficiency of fxhash-related applications, the indexer creates a new MediaImage entry with a CID pointing to resource when it finds an image resource, and with the other fields set to null. A side worker will keep looking for unprocessed entries in this table and will process their medias, seeding the entry in the database with usueful information such as a base64 placeholder, resolution and mime type.",
})
export class MediaImage extends BaseEntity {
  @Field({
    description: "The IPFS CID of the resource"
  })
  @PrimaryColumn({
    type: "char",
    length: 46
  })
  cid: string

  @Field(() => Int, {
    description: "The width of the original image resource, in pixels. If null, the media has not been processed yet.",
    nullable: true,
  })
  @Column({
    type: "int",
    nullable: true,
  })
  width: number | null
  
  @Field(() => Int, {
    description: "The height of the original image resource, in pixels. If null, the media has not been processed yet.",
    nullable: true,
  })
  @Column({
    type: "int",
    nullable: true,
  })
  height: number | null

  @Field(() => String, {
    description: "A downscaled base64 encoded version of the original image (bilinear filter), contained in a 12x12 square. If null, this media has not been processed yet.",
    nullable: true,
  })
  @Column({
    type: "text",
    nullable: true,
  })
  placeholder: string | null

  @Field(() => String, {
    description: "The mime type of the original image. If null, this media has not been processed yet.",
    nullable: true,
  })
  @Column({ 
    type: "varchar",
    length: 255,
    nullable: true
  })
  mimeType: string | null

  @Field(() => GraphQLJSONObject, {
    description: "Eventual additional metadata about the image. For now, never populated (will always be null).",
    nullable: true,
  })
  @Column({
    type: "json",
    nullable: true
  })
  metadata: Record<string, string> | null

  @Field({
    description: "Whether or not this media has been processed by fxhash worker. When true, other fiels of this entity should be populated. If media is marked as `processed`, but fields are still empty, the media could not be processed by the worker.",
    nullable: true,
  })
  @Column({ default: false })
  processed: boolean = false

  @Field({
    description: "When the fxhash worker goes through the images, it may sometimes encounter an error and fail. This counter is incremented whenever a fail is encountered. Media will be ignored by the worker once this counter gets too big.",
  })
  @Column({ default: 0, type: "smallint" })
  processCounters: number = 0
}