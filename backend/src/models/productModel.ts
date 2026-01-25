import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  user: mongoose.Schema.Types.ObjectId;
  name: string;
  imageUrl: string;
  flavor: string;
  description: string;
  price: number;
  countInStock: number;
}

const productSchema: Schema = new Schema(
  {
    // Link to the Admin who created the product [cite: 193]
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true }, // Matches Product Class [cite: 186]
    imageUrl: { type: String, required: true }, // Matches Product Class 'imageUrl' [cite: 186]
    flavor: { type: String, required: true }, // Specific to Peanut Butter store requirements
    description: { type: String, required: true }, // Matches Product Class [cite: 186]
    price: { type: Number, required: true, default: 0 }, // Matches Product Class [cite: 186]
    countInStock: { type: Number, required: true, default: 0 }, // Matches Product Class 'stock' [cite: 186]
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;