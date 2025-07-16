import connectDB from "@/lib/mongo";
import Post from "@/models/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { revalidatePath } from "next/cache";
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { title, content, category } = await request.json();
    if (!title || !content || !category) {
      return NextResponse.json(
        { message: "Title, content, and category are required" },
        { status: 400 }
      );
    }
    await connectDB();
    // إنشاء الـ slug من العنوان
    const baseSlug = slugify(title, {
      lower: true, // تحويل إلى أحرف صغيرة
      strict: true, // إزالة الأحرف غير المدعومة
      locale: "ar", // دعم اللغة العربية إذا كان العنوان بالعربية
      trim: true,
    });

    // التحقق من وجود slug مكرر (للتأكد من التفرد)
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newPost = new Post({
      title,
      content,
      author: session.user.id,
      slug: finalSlug,
      category,
    });
    await newPost.save();
    revalidatePath("/dashboard/posts");
    revalidatePath("/");
    return NextResponse.json({ newPost }, { status: 201 });
  } catch (error) {
    // هذا يعالج حالة خاصة إذا حاول المستخدم إنشاء منشور بعنوان موجود بالفعل
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json(
        { message: "A post with this title already exists." },
        { status: 409 }
      ); // 409 Conflict
    }
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
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
