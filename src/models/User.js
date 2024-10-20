import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
  edad: Number,
  peso: Number,
  estatura: Number,
  telefono: String,
  pais: String,
  photoUrl: String
});

const User = mongoose.model('User', userSchema);

export default User;
