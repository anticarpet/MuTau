import { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  Name: { type: String, required: true, trim: true },
  Mail: { type: String, required: true, unique: true, lowercase: true },
  Password: { type: String, required: true },
  Systems: [{ type: Schema.Types.ObjectId, ref: 'System' }],
  Data: [{ type: Schema.Types.ObjectId }],
});

export default models.User ?? model('User', userSchema, 'users');