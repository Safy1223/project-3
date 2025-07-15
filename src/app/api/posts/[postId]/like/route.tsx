import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongo";
import Post from "@/models/Post";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    postId: string;
  }>;
};
export async function POST(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      // إذا لم يكن هناك جلسة، أعد استجابة خطأ 401 Unauthorized
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const resolvedParams = await params; // فكّ الـ Promise
    const userId = session.user.id;
    await connectDB();
    const post = await Post.findById(resolvedParams.postId);
    const user = await User.findById(userId);

    if (!post) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    const isLiked = post.likes.includes(userId); //  post.likes موجود داخل  userIdتتحقق إن
    if (isLiked) {
      // --- إلغاء الإعجاب ---
      // إزالة معرف المستخدم من مصفوفة likes في المنشور
      post.likes.pull(userId);
      // إزالة معرف المنشور من مصفوفة likedPosts في المستخدم
      user.likedPosts.pull(resolvedParams.postId);
    } else {
      // --- إضافة الإعجاب ---
      // إضافة معرف المستخدم إلى مصفوفة likes في المنشور
      post.likes.push(userId);
      // إضافة معرف المنشور إلى مصفوفة likedPosts في المستخدم
      user.likedPosts.push(resolvedParams.postId);
    }
    // 3. حفظ التغييرات
    await post.save();
    await user.save();

    // 4. إرجاع الحالة الجديدة للإعجاب وعدد الإعجابات
    return NextResponse.json(
      {
        isLiked: !isLiked, // الحالة الجديدة (عكس الحالة القديمة)
        likesCount: post.likes.length, // post.liskيرجع عدد الإعجابات بعد التعديل  عدد العناصر داخل
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { message: "Error toggling like." },
      { status: 500 }
    );
  }
}
