import { Schema, model, models } from 'mongoose';

const commandSchema = new Schema({
  command: { type: String, required: true },
  value: { type: String, required: true },
});

const systemSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  commands: [commandSchema],
  ESPs: [{ type: Schema.Types.ObjectId, ref: 'ESP' }],
});

export default models.System ?? model('System', systemSchema, 'systems');