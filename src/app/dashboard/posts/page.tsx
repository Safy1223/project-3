import DeleteFormWithConfirmation from "@/components/DeleteFormWithConfirmation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import connectDB from "@/lib/mongo";
import Post from "@/models/Post";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";

type PostType = {
  _id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
};
type HomePageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

// تعريف عدد المنشورات في كل صفحة
const POSTS_PER_PAGE = 5;
async function getPosts(page: number = 1, userId?: string) {
  const skip = (page - 1) * POSTS_PER_PAGE;
  // إنشاء كائن تصفية
  const filter: { author?: string } = {};
  if (userId) {
    filter.author = userId;
  }

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip) // تخطي عدد معيّن حسب الصفحة
    .limit(POSTS_PER_PAGE) // الحد الأعلى لعدد المنشورات بالصفحة
    .lean<PostType[]>();
  const totalPosts = await Post.countDocuments(filter);
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE); //يحسب كم صفحة نحتاجها لعرض كل المنشورات
  return { posts, totalPages };
}

const DashboardPostsPage = async ({ searchParams }: HomePageProps) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectDB();
  const resolvedParams = await searchParams; // فكّ الـ Promise
  const currentPage = Number(resolvedParams.page) || 1;
  const { posts, totalPages } = await getPosts(currentPage, session.user.id);
  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6 p-4 md:p-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📋 My Posts</h1>
        <Link href="/dashboard/posts/new">
          <Button className="cursor-pointer">
            <PlusCircle className="mr-2 h-4 w-4 " />
            New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No posts yet.</h2>
          <p className="text-gray-500 mt-2">
            Click on &quot;New Post&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post._id} className="shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{post.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Created on:{" "}
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Link href={`/dashboard/posts/${post._id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer "
                    >
                      Edit
                    </Button>
                  </Link>
                  {/* form للحذف */}
                  <DeleteFormWithConfirmation
                    postId={post._id.toString()}
                    postTitle={post.title}
                  />
                  <Link href={`/dashboard/postsSlug/${post.slug}`}>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="  cursor-pointer "
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{post.content.slice(0, 100)}...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 space-x-4">
          {currentPage > 1 ? (
            <Link href={`/dashboard/posts/?page=${currentPage - 1}`}>
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
            <Link href={`/dashboard/posts/?page=${currentPage + 1}`}>
              <Button variant="outline">Next</Button>
            </Link>
          ) : (
            <Button variant="outline" disabled>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPostsPage;
