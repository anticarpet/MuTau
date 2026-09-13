import { Schema, model, models } from 'mongoose';

const predictionEntrySchema = new Schema({
  name: { type: String, required: true },
  values: [{ type: Schema.Types.Mixed }],
});

const predictionSchema = new Schema({
  system: { type: Schema.Types.ObjectId, ref: 'System', required: true },
  predictions: [predictionEntrySchema],
});

export default models.Prediction ?? model('Prediction', predictionSchema, 'predictions');