import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  category: 'ring' | 'bracelet' | 'necklace' | 'stone';
  price: number;
  salePrice?: number;
  isSale: boolean;
  images: string[];
  crystalType: string;
  origin: string;
  stock: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['ring', 'bracelet', 'necklace', 'stone'],
    required: true
  },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  isSale: { type: Boolean, default: false },
  images: [{ type: String, required: true }],
  crystalType: { type: String, required: true },
  origin: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
