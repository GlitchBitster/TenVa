import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  mobileNumber?: string;
  passwordHash?: string;
  authProvider: 'credentials' | 'google' | 'magic-link' | 'otp';
  role: 'user' | 'admin';
  wishlist: mongoose.Types.ObjectId[];
  addresses: IAddress[];
  createdAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
});

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobileNumber: { type: String },
  passwordHash: { type: String },
  authProvider: {
    type: String,
    enum: ['credentials', 'google', 'magic-link', 'otp'],
    default: 'credentials'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [AddressSchema],
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
