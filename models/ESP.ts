import { Schema, model, models } from 'mongoose';

const readingSchema = new Schema({
  type: { type: String, required: true },
  node: { type: Number, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
});

const espSchema = new Schema({
  readings: [readingSchema],
  devices: [{ type: String }],
  health: {
    status: { type: String, required: true },
    desc: { type: String, required: true },
  },
});

export default models.ESP ?? model('ESP', espSchema, 'esps');