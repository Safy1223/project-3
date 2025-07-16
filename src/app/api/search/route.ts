import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Post from "@/models/Post";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url); //يجلب الرابط كاملا
  const query = searchParams.get("q"); //من الرابط q استخراج قيمة ال
  if (!query) {
    return NextResponse.json(
      { message: "Search query is required" },
      { status: 400 }
    );
  }
  try {
    await connectDB();
    //يعني البحث غير حساس لحالة الأحرف
    const searchRegex = new RegExp(query, "i");
    const posts = await Post.find({
      $or: [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
      ],
    })
      .sort({ createdAt: -1 }) // ترتيب النتائج من الأحدث إلى الأقدم
      .lean(); // استخدام .lean() للحصول على كائنات بسيطة وتحسين الأداء
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
