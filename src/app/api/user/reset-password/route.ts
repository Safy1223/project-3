import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await connectDB();

  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token and new password are required." },
        { status: 400 }
      );
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    //البحث عن المستخدم باستخدام الرمز المميز وتاريخ انتهاء الصلاحية
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // الرمز المميز يجب أن يكون صالحًا (أكبر من الوقت الحالي)
    });
    if (!user) {
      return NextResponse.json(
        { message: "Password reset token is invalid or has expired." },
        { status: 400 }
      );
    }
    //تشفير كلمة المرور الجديدة وتحديثها
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return NextResponse.json(
      { message: "Password has been reset successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
