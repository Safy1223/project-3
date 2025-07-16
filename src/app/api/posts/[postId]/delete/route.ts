import connectDB from "@/lib/mongo";
import Post from "@/models/Post";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // استيراد getServerSession
import { authOptions } from "@/lib/authOptions";

type Props = {
  params: Promise<{
    postId: string;
  }>;
};
export async function DELETE(req: Request, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    // إذا لم يكن هناك جلسة، أعد استجابة خطأ 401 Unauthorized
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const resolvedParams = await params; // فكّ الـ Promise
  await connectDB();
  await Post.findByIdAndDelete(resolvedParams.postId);
  return NextResponse.redirect(new URL("/dashboard/posts", req.url));
}
