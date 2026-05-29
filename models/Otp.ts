import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtp extends Document {
  target: string; // email address or phone number
  code: string;   // 6-digit OTP code
  type: 'email' | 'mobile';
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  target: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['email', 'mobile'], required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Expires automatically in 5 minutes (300s)
});

// Compound index to quickly find an OTP by target and code
OtpSchema.index({ target: 1, code: 1 }, { unique: true });

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);

export default Otp;
