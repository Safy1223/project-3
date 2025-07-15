// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User from "@/models/User";
import crypto from "crypto"; // لاستخدام crypto.randomBytes
import nodemailer from "nodemailer"; // لاستخدام Nodemailer

export async function POST(req: Request) {
  await connectDB();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      // لأسباب أمنية، لا تخبر المستخدم ما إذا كان البريد الإلكتروني موجودًا أم لا
      // فقط أرسل استجابة نجاح وهمية
      return NextResponse.json(
        {
          message:
            "If a user with that email exists, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // 1. إنشاء رمز مميز (token) فريد
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const passwordResetExpire = Date.now() + 3600000; // 1 ساعة من الآن

    // 2. حفظ الرمز المميز ووقت انتهاء الصلاحية في قاعدة البيانات
    user.resetPasswordToken = passwordResetToken;
    user.resetPasswordExpire = passwordResetExpire;
    await user.save();

    // 3. إعداد Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // يمكنك تغيير هذا إلى خدمة البريد الإلكتروني الخاصة بك
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // 4. إنشاء رابط إعادة تعيين كلمة المرور
    const resetUrl = `${req.headers.get(
      "origin"
    )}/reset-password?token=${resetToken}`;

    // 5. إعداد خيارات البريد الإلكتروني
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>This link is valid for 1 hour.</p>
      `,
    };

    // 6. إرسال البريد الإلكتروني
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        message:
          "If a user with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
