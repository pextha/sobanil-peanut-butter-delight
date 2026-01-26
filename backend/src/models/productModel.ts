import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  user: mongoose.Schema.Types.ObjectId;
  name: string;
  imageUrl: string;
  flavor: string;
  category: string; 
  weight: string; 
  description: string;
  price: number;
  countInStock: number;
}

const productSchema: Schema = new Schema(
  {
    // Link to the Admin who created the product
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    flavor: { type: String, required: true }, 
    category: { type: String, required: true }, // Crucial for your Shop filters
    weight: { type: String, required: true, default: '200g' }, // Crucial for display
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;