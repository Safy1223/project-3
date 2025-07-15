// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await connectDB(); // الاتصال بقاعدة البيانات

  try {
    const { username, email, password } = await request.json();

    // name او email يبحث في قاعدة البيانات عن مستخدم موجود مسبقًا ما أن يكون لديه نفس
    //{ $or: [...] }  ابحث عن مستند يحقق أحد الشرطين على الأقل (أو كلاهما). Mongodb في  OR هذا عامل
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email or username already exists." },
        { status: 409 } // Conflict
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10); // 10 هو saltRounds

    // إنشاء مستخدم جديد
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save(); // حفظ المستخدم في قاعدة البيانات

    return NextResponse.json(
      { message: "User registered successfully." },
      { status: 201 } // Created
    );
  } catch (error) {
    console.error("Error during user registration:", error);
    return NextResponse.json(
      { message: "Something went wrong during registration." },
      { status: 500 } // Internal Server Error
    );
  }
}
