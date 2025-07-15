import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Comment from "@/models/Comment";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // تأكد من المسار الصحيح لـ authOptions
import Post from "@/models/Post";

type Props = {
  params: Promise<{
    postId: string;
  }>;
};
export async function POST(req: Request, { params }: Props) {
  const resolvedParams = await params;
  await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { content } = await req.json();
    const userId = session.user.id;
    if (!content) {
      return NextResponse.json(
        { message: "Comment content is required." },
        { status: 400 }
      );
    }
    const post = await Post.findById(resolvedParams.postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }
    const newComment = new Comment({
      content,
      author: userId,
      post: resolvedParams.postId,
    });
    await newComment.save();
    //إضافة معرف التعليق إلى مصفوفة التعليقات في المنشور
    post.comments.push(newComment._id);
    await post.save();
    //جلب التعليق مع بيانات المؤلف
    const populatedComment = await Comment.findById(newComment._id).populate(
      "author",
      "username email"
    );
    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { message: "Error creating comment." },
      { status: 500 }
    );
  }
}
export async function GET(req: Request, { params }: Props) {
  const resolvedParams = await params;
  await connectDB();
  try {
    const post = await Post.findById(resolvedParams.postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }
    const comments = await Comment.find({ post: resolvedParams.postId })
      .populate("author", "username email")
      .sort({ createdAt: 1 });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { message: "Error fetching comments." },
      { status: 500 }
    );
  }
}
