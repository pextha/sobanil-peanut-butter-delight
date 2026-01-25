import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;
  orderItems: {
    name: string;
    qty: number;
    imageUrl: string;
    price: number;
    product: mongoose.Schema.Types.ObjectId;
  }[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt: Date;
  isDelivered: boolean;
  deliveredAt: Date;
}

const orderSchema: Schema = new Schema(
  {
    // Link to the Customer who placed the order [cite: 157]
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Matches 'OrderItem' Class 
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true }, // Matches 'quantity' [cite: 190]
        imageUrl: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    // Capture delivery details (FR-9 Checkout) [cite: 37]
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    // Matches 'Payment' Class [cite: 209]
    paymentMethod: { type: String, required: true },
    // Stores response from Payment Gateway [cite: 130]
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    // Costs breakdown
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 }, // Matches Order 'totalAmount' [cite: 200]
    
    // Status Flags
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date }, // Matches Payment 'paymentDate' [cite: 207]
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true, // Stores Order Date [cite: 198]
  }
);

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;