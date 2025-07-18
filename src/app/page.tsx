import connectDB from "@/lib/mongo";
import Post from "@/models/Post";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, User } from "lucide-react";
type PostType = {
  _id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  author: {
    username: string;
  };
};

// تعريف عدد المنشورات في كل صفحة
const POSTS_PER_PAGE = 6;

async function getPosts(page: number = 1) {
  await connectDB();
  const skip = (page - 1) * POSTS_PER_PAGE;
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip(skip) // تخطي عدد معيّن حسب الصفحة
    .limit(POSTS_PER_PAGE) // الحد الأعلى لعدد المنشورات بالصفحة
    .populate("author", "username")
    .lean<PostType[]>();
  const totalPosts = await Post.countDocuments();
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE); //يحسب كم صفحة نحتاجها لعرض كل المنشورات
  return { posts, totalPages };
}

type HomePageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams; // فكّ الـ Promise
  const currentPage = Number(resolvedParams.page) || 1;
  const { posts, totalPages } = await getPosts(currentPage);
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="text-center py-12 md:py-20 bg-slate-50 rounded-lg mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          The Modern Blog
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          Insights, stories, and ideas from the world of tech and development.
        </p>
      </section>
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">Latest Posts</h2>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500  py-10">
          No posts have been published yet.
        </p>
      ) : (
        <div
          dir="rtl"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
        >
          {posts.map((post) => (
            <Card
              key={post._id.toString()}
              className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader>
                <Link href={`/dashboard/postsSlug/${post.slug}`}>
                  <CardTitle className="text-xl font-bold text-gray-900 hover:text-blue-700 transition-colors">
                    {post.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 leading-relaxed text-sm">
                  {post.content.substring(0, 120)}...
                </p>
                <div className="mt-4 flex items-center text-xs text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1.5" />
                    <span>{post.author?.username || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
              {/* تعديل: تم استبدال CardFooter برابط مباشر في الأسفل */}
              <div className="p-4 bg-gray-50">
                <Link
                  href={`/dashboard/postsSlug/${post.slug}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center"
                >
                  Read More
                  <ArrowLeft className="mr-1 h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* قسم ترقيم الصفحات */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 space-x-4">
          {currentPage > 1 ? (
            <Link href={`/?page=${currentPage - 1}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          ) : (
            <Button variant="outline" disabled>
              Previous
            </Button>
          )}
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link href={`/?page=${currentPage + 1}`}>
              <Button variant="outline">Next</Button>
            </Link>
          ) : (
            <Button variant="outline" disabled>
              Next
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
