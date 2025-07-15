import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Post from "@/models/Post";

type Props = {
  params: Promise<{
    postId: string;
  }>;
};
export async function GET(request: Request, { params }: Props) {
  const resolvedParams = await params; // فكّ الـ Promise
  if (!resolvedParams.postId) {
    return NextResponse.json(
      { message: "Post ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // استخدم .lean() للحصول على كائن بسيط
    const post = await Post.findById(resolvedParams.postId).lean();

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // أرجع بيانات المنشور كـ JSON
    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    // معالجة الأخطاء المحتملة (مثل ID غير صالح)
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
