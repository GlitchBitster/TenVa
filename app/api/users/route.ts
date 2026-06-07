import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import logger from "@/lib/logger";

// GET all users (Admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 }).select("-passwordHash");
    return NextResponse.json(users);
  } catch (error: any) {
    logger.error("GET Users Error", error);
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

// POST register new user
export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const { fullName, email, mobileNumber, password } = data;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: emailLower,
      mobileNumber: mobileNumber || undefined,
      passwordHash,
      authProvider: "credentials",
      role: "user",
      wishlist: [],
      addresses: [],
    });

    // Remove passwordHash from returned object
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return NextResponse.json(userObj, { status: 201 });
  } catch (error: any) {
    logger.error("POST User Register Error", error);
    return NextResponse.json({ error: error.message || "Failed to register user" }, { status: 500 });
  }
}

// PUT update current user profile or address list
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const { fullName, email, mobileNumber, addresses } = data;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: any = {};

    if (fullName) updates.fullName = fullName;
    if (email) {
      const emailLower = email.toLowerCase().trim();
      if (emailLower !== user.email) {
        // Verify email uniqueness
        const emailExists = await User.findOne({ email: emailLower });
        if (emailExists) {
          return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }
        updates.email = emailLower;
      }
    }
    if (mobileNumber !== undefined) updates.mobileNumber = mobileNumber;
    if (addresses !== undefined) updates.addresses = addresses;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updates },
      { new: true }
    ).select("-passwordHash");

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    logger.error("PUT User Error", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
