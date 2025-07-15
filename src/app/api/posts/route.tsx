import connectDB from "@/lib/mongo";
import Post from "@/models/Post";
import { getServerSession } from "next-auth/next"; // استيراد getServerSession
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // استيراد authOptions
import { NextResponse } from "next/server";
import slugify from "slugify"; // <--- استيراد slugify

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    // إذا لم يكن هناك جلسة، أعد استجابة خطأ 401 Unauthorized
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const userId = session.user.id; // <--- معرف المستخدم من الجلسة
  const { title, content, category } = await request.json();
  if (!title || !content || !category) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  // إنشاء الـ slug من العنوان
  const newSlug = slugify(title, {
    lower: true, // تحويل إلى أحرف صغيرة
    strict: true, // إزالة الأحرف غير المدعومة
    locale: "ar", // دعم اللغة العربية إذا كان العنوان بالعربية
  });

  // التحقق من وجود slug مكرر (للتأكد من التفرد)
  let finalSlug = newSlug;
  let counter = 1;
  while (await Post.findOne({ slug: finalSlug })) {
    finalSlug = `${newSlug}-${counter}`;
    counter++;
  }

  const newPost = new Post({
    title,
    content,
    author: userId,
    slug: finalSlug,
    category,
  });
  await newPost.save();
  return NextResponse.json({ newPost }, { status: 201 });
}
//اختبار الإتصال
export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: "MongoDB connection successful" });
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : String(error);
    return NextResponse.json(
      {
        error: "MongoDB connection failed",
        details: message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
