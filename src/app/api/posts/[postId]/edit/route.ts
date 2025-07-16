import connectDB from "@/lib/mongo";
import Post from "@/models/Post";
import { getServerSession } from "next-auth/next"; // استيراد getServerSession
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

type Props = {
  params: Promise<{
    postId: string;
  }>;
};
export async function PUT(req: Request, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    // إذا لم يكن هناك جلسة، أعد استجابة خطأ 401 Unauthorized
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const resolvedParams = await params; // فكّ الـ Promise
  if (!resolvedParams.postId) {
    return NextResponse.json(
      { message: "Post ID is required" },
      { status: 400 }
    );
  }
  try {
    const { title, content, category } = await req.json();
    if (!title || !content || !category) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    await connectDB();

    const postToUpdate = await Post.findById(resolvedParams.postId);
    if (!postToUpdate) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (postToUpdate.author.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden: You are not the author of this post" },
        { status: 403 }
      );
    }

    let newSlug = postToUpdate.slug; // استخدم الـ slug القديم كقيمة افتراضية
    if (title !== postToUpdate.title) {
      // تحقق مما إذا كان العنوان قد تغير
      const baseSlug = slugify(title, {
        lower: true, // تحويل إلى أحرف صغيرة
        strict: true, // إزالة الأحرف غير المدعومة
        trim: true,
      });
      let finalSlug = baseSlug;
      let counter = 1;
      // تحقق من التفرد، مع تجاهل المنشور الحالي
      while (
        await Post.findOne({
          slug: finalSlug,
          _id: { $ne: resolvedParams.postId },
        })
      ) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      newSlug = finalSlug;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      resolvedParams.postId,
      { title, content, category, slug: newSlug },
      { new: true } //"رجّع لي الوثيقة الجديدة بعد التحديث،
    ).lean();

    //اعادة التوجيه بعد نجاح التعديل
    // 6. إبطال ذاكرة التخزين المؤقت
    revalidatePath("/dashboard/posts");
    revalidatePath(`/posts/${newSlug}`);
    revalidatePath(`/categories`);

    // 7. إرجاع استجابة JSON ناجحة (بدلاً من إعادة التوجيه)
    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
