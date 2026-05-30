import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { file } = await req.json(); // Base64 string from client FileReader

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(file, {
      folder: "tenva_products",
    });

    return NextResponse.json({ url: uploadRes.secure_url });
  } catch (error: any) {
    console.error("Cloudinary Upload Endpoint Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image to Cloudinary" }, { status: 500 });
  }
}
export const maxDuration = 60; // Allow enough time for image uploads
