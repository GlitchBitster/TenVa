import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await connectDB();
        const email = (credentials.email as string).toLowerCase();
        const user = await User.findOne({ email });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          name: user.fullName,
          role: user.role,
          mobileNumber: user.mobileNumber,
        } as any;
      },
    }),
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        target: { label: "Target", type: "text" },
        code: { label: "Code", type: "text" },
        type: { label: "Type", type: "text" }, // 'email' or 'mobile'
        fullName: { label: "FullName", type: "text" }, // optional, for signup
      },
      async authorize(credentials) {
        if (!credentials?.target || !credentials?.code || !credentials?.type) {
          throw new Error("Missing OTP details");
        }

        await connectDB();
        const target = (credentials.target as string).toLowerCase().trim();
        const code = credentials.code as string;
        const type = credentials.type as 'email' | 'mobile';

        // 1. Verify OTP from DB
        const otpRecord = await Otp.findOne({ target, code, type });
        if (!otpRecord) {
          throw new Error("Invalid or expired OTP");
        }

        // 2. Consume OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        // 3. Find or Create User
        let user;
        if (type === "email") {
          user = await User.findOne({ email: target });
          if (!user) {
            // Register new user via email OTP
            user = await User.create({
              fullName: (credentials.fullName as string) || target.split("@")[0],
              email: target,
              authProvider: "magic-link",
              role: "user",
              wishlist: [],
              addresses: [],
            });
          }
        } else {
          // Mobile number OTP
          user = await User.findOne({ mobileNumber: target });
          if (!user) {
            // Register new user via mobile OTP
            // We need a dummy or temporary email since email is unique and required in our Schema
            const tempEmail = `phone_${target.replace("+", "")}@tanvi.com`;
            // Check if email already exists (edge case)
            const emailExists = await User.findOne({ email: tempEmail });
            const finalEmail = emailExists ? `phone_${target.replace("+", "")}_${Date.now()}@tanvi.com` : tempEmail;

            user = await User.create({
              fullName: (credentials.fullName as string) || `User ${target.slice(-4)}`,
              email: finalEmail,
              mobileNumber: target,
              authProvider: "otp",
              role: "user",
              wishlist: [],
              addresses: [],
            });
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          name: user.fullName,
          role: user.role,
          mobileNumber: user.mobileNumber,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.mobileNumber = (user as any).mobileNumber || "";
        token.fullName = (user as any).fullName || user.name || "";
      }
      if (trigger === "update" && session) {
        if (session.fullName) token.fullName = session.fullName;
        if (session.mobileNumber) token.mobileNumber = session.mobileNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.mobileNumber = token.mobileNumber as string;
        session.user.fullName = token.fullName as string;
        // Keep name updated
        session.user.name = token.fullName as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const email = user.email?.toLowerCase();
        if (!email) return false;

        let existingUser = await User.findOne({ email });
        if (!existingUser) {
          // Check if user has registered with this email via magic link/credentials already
          existingUser = await User.create({
            fullName: user.name || "Google User",
            email,
            authProvider: "google",
            role: "user",
            wishlist: [],
            addresses: [],
          });
        }
        user.id = existingUser._id.toString();
        (user as any).role = existingUser.role;
        (user as any).mobileNumber = existingUser.mobileNumber;
        (user as any).fullName = existingUser.fullName;
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    newUser: "/signup",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
