/**
 * @file Contains the mongoose model definition for a file stored in the database. The file is saved as a buffer along with metadata. The file must be less than 16mb due to Mongo document size limitations
 * @author Bilal Shaikh
 * @copyright Biosimulations Team, 2020
 * @license MIT
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as SchemaType } from 'mongoose';
import { isUrl } from '@biosimulations/datamodel-database';

@Schema({ collection: 'Simulation Files' })
export class SimulationFile extends Document {
  @Prop({ type: String, required: false })
  public originalname?: string;
  @Prop({ type: String, required: false })
  public encoding?: string;
  @Prop({ type: String, required: false })
  public mimetype?: string;
  @Prop({ type: String, required: false })
  public size?: number;
  @Prop({ type: String, required: true, validate: [isUrl] })
  public url!: string;
}

export const SimulationFileSchema: SchemaType<SimulationFile> =
  SchemaFactory.createForClass(SimulationFile);
SimulationFileSchema.set('strict', 'throw');
