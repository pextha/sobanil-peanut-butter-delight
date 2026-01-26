import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const flavorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const weightSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

export const Category = mongoose.model('Category', categorySchema);
export const Flavor = mongoose.model('Flavor', flavorSchema);
export const Weight = mongoose.model('Weight', weightSchema);