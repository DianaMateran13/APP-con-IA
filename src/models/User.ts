import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  nombre: string;
  edad: number;
  peso: number;
  estatura: number;
  email: string;
  password: string;
  telefono: string;
  pais: string;
}

const UserSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  edad: { type: Number, required: true },
  peso: { type: Number, required: true },
  estatura: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String, required: true },
  pais: { type: String, required: true }
});

export default mongoose.model<IUser>('User', UserSchema);
