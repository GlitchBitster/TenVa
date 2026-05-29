import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  try {
    const { target, code, type } = await req.json();

    if (!target || !code || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const otpRecord = await Otp.findOne({
      target: target.toLowerCase().trim(),
      code,
      type,
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "OTP verified successfully" });
  } catch (error: any) {
    console.error("Error in OTP verify route:", error);
    return NextResponse.json({ error: error.message || "Failed to verify OTP" }, { status: 500 });
  }
}
