import mongoose, { Document, Schema } from 'mongoose';

// 1. Define Review Schema (Sub-document)
const reviewSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

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
  // New Fields
  reviews: any[];
  rating: number;
  numReviews: number;
}

const productSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    flavor: { type: String, required: true },
    category: { type: String, required: true },
    weight: { type: String, required: true, default: '200g' },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    
    // 2. Add New Fields to Product
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;