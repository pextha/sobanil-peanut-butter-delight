import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface defining the structure for TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  addresses: any[];
  wishlist: any[];
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true }, // Matches User Class [cite: 167]
    email: { type: String, required: true, unique: true }, // Matches User Class [cite: 168]
    password: { type: String, required: true }, // Matches User Class [cite: 169] and FR-16 (Secure Auth) 
    isAdmin: { type: Boolean, required: true, default: false }, // false = Customer, true = Admin [cite: 73]
    addresses: [{
      name: { type: String, required: false },
      phone: { type: String, required: false },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      isDefault: { type: Boolean, required: true, default: false },
    }],
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to encrypt password before saving (FR-16)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;