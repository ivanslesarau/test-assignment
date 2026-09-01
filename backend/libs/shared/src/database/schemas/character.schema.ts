import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CharacterDocument = Character & Document;

@Schema({ timestamps: true })
export class Character {
  @Prop({ required: true, unique: true })
  externalId: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  species: string;

  @Prop({ required: true })
  imageUrl: string;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);

CharacterSchema.index({ name: 1 });
CharacterSchema.index({ species: 1 });
