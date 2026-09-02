import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EventLogDocument = EventLog & Document;

@Schema({ timestamps: true })
export class EventLog {
  @Prop({ required: true, enum: ['SEARCH', 'POLYGON_CREATE'] })
  eventType: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  payload: Record<string, string | number>;

  @Prop({ required: true })
  timestamp: number;
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);
