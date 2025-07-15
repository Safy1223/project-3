import connectDB from "@/lib/mongo";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import Comment from "@/models/Comment";
import Post from "@/models/Post";

type Props = {
  params: Promise<{
    commentId: string;
  }>;
};

export async function DELETE(req: Request, { params }: Props) {
  const resolvedParams = await params;
  await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const comment = await Comment.findById(resolvedParams.commentId);
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found." },
        { status: 404 }
      );
    }
    if (comment.author.toString() !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    await Comment.findByIdAndDelete(resolvedParams.commentId);

    //ابحث عن المنشور وعدّله
    // الخاص بالمنشور الذي يحتوي التعليقObject هو ال: comment.post
    //$pull: يحذف قيمة معينة من مصفوفة داخل الوثيقة
    //اللي تخزن تعليقات schema  اسم المصفوفة في الcomments
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: resolvedParams.commentId },
    });
    return NextResponse.json(
      { message: "Comment deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { message: "Error deleting comment." },
      { status: 500 }
    );
  }
}
