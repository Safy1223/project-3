import { authOptions } from "@/lib/authOptions";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import connectDB from "@/lib/mongo";
import Post from "@/models/Post";
import { Types } from "mongoose";
import { getServerSession } from "next-auth/next";
import { notFound } from "next/navigation";
import React from "react";
import Link from "next/link";
import { Tag } from "lucide-react";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};
type postType = {
  _id: string;
  title: string;
  content: string;
  author: string;
  slug: string;
  likes: Types.ObjectId[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
};
const getPostBySlug = async ({ params }: Props) => {
  const resolvedParams = await params;
  await connectDB();
  const session = await getServerSession(authOptions);
  const post = await Post.findOne({
    slug: resolvedParams.slug,
  })
    .populate("category", "name slug")
    .lean<postType>();
  if (!post) {
    notFound();
  }
  // توفير قيمة افتراضية (مصفوفة فارغة) إذا كان post.likes غير موجود
  const likes = post.likes || [];

  const initialIsLiked = session
    ? likes.some((like) => like.toString() === session.user.id)
    : false; //اذا وجد  true تبحث إذا يوجد عنصر واحد يطابق شرط معين ترجع
  const initialLikesCount = likes.length;

  return (
    <article className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-4">
        {post.category ? ( // 6. تحقق من وجود الفئة قبل عرضها
          <Link
            href={`/dashboard/categories/${post.category.slug}`}
            className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Tag className="h-4 w-4 mr-2" />
            {post.category.name}
          </Link>
        ) : null}
      </div>

      <h1 className="text-4xl font-bold mb-2 text-gray-900">{post.title}</h1>

      <p className="text-sm text-gray-500 mb-6">
        Posted on{" "}
        {new Date(post.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {/* زر الإعجاب */}
      <div className="mb-8">
        <LikeButton
          postId={post._id.toString()}
          initialLikesCount={initialLikesCount}
          initialIsLiked={initialIsLiked}
        />
      </div>

      {/* محتوى المقال */}
      <div className="prose lg:prose-xl max-w-none">
        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </div>

      <hr className="my-8 border-gray-200" />

      {/* قسم التعليقات */}
      <CommentSection postId={post._id.toString()} session={session} />
    </article>
  );
};

export default getPostBySlug;
