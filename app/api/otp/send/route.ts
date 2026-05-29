import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Otp from "@/models/Otp";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { target, type } = await req.json();

    if (!target || !type || !['email', 'mobile'].includes(type)) {
      return NextResponse.json({ error: "Invalid target or type" }, { status: 400 });
    }

    await connectDB();

    // 1. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Delete any existing OTP for this target to prevent bloating
    await Otp.deleteMany({ target, type });

    // 3. Save OTP to DB
    await Otp.create({
      target: target.toLowerCase().trim(),
      code: otpCode,
      type,
    });

    // 4. Send OTP
    if (type === "email") {
      // Setup Nodemailer
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"TanVi Crystals" <${smtpUser}>`,
          to: target,
          subject: "TanVi Magic Login Code",
          text: `Your TanVi Magic Sign In OTP is: ${otpCode}. It is valid for 5 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0D0A1A; color: #F5F0FF; padding: 40px; text-align: center; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(107, 33, 168, 0.3);">
              <h2 style="color: #D4AF7A; font-size: 24px; margin-bottom: 20px;">TanVi Crystals</h2>
              <p style="font-size: 16px; margin-bottom: 30px; color: #A0A0A8;">Use the verification code below to complete your sign-in. This code is valid for 5 minutes.</p>
              <div style="background-color: #1A1028; border: 1px solid #6B21A8; border-radius: 8px; padding: 15px 30px; font-size: 32px; font-weight: bold; color: #F5F0FF; letter-spacing: 5px; display: inline-block; margin-bottom: 30px;">
                ${otpCode}
              </div>
              <p style="font-size: 12px; color: #6B21A8;">If you did not request this, please ignore this email.</p>
            </div>
          `,
        });
        console.log(`[SMTP] Sent OTP ${otpCode} to ${target}`);
      } else {
        // Local fallback log
        console.log(`\n---------------------------------------------\n[LOCAL DEV] OTP Generated for ${target}: ${otpCode}\n---------------------------------------------\n`);
      }
    } else {
      // Mobile SMS
      const msg91AuthKey = process.env.MSG91_AUTH_KEY;
      const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;

      if (msg91AuthKey && msg91TemplateId) {
        // Send SMS via MSG91 API
        try {
          const res = await fetch("https://control.msg91.com/api/v5/otp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "authkey": msg91AuthKey,
            },
            body: JSON.stringify({
              template_id: msg91TemplateId,
              mobile: target.replace("+", ""), // MSG91 expects number without + prefix
              otp: otpCode,
            }),
          });
          const result = await res.json();
          console.log("[MSG91 SMS] Sent SMS response:", result);
        } catch (smsError) {
          console.error("[SMS ERROR] Failed to send SMS via MSG91:", smsError);
        }
      } else {
        // Local fallback log
        console.log(`\n---------------------------------------------\n[LOCAL DEV] Mobile OTP Generated for ${target}: ${otpCode}\n---------------------------------------------\n`);
      }
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Error in OTP send route:", error);
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
  }
}
