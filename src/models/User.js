import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // ... (definición del esquema)
});

export default mongoose.model('User', userSchema);
