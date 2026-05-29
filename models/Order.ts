import mongoose, { Schema, Document, Model } from "mongoose";
import { IAddress } from "./User";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  qty: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  deliveryAddress: IAddress;
  status: 'pending' | 'confirmed' | 'delivered';
  whatsappSent: boolean;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 1 },
});

const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered'],
    default: 'pending'
  },
  whatsappSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
