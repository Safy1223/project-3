import connectDB from "@/lib/mongo";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

type PostType = {
  _id: string;
  title: string;
  content: string;
  slug: string;
};
interface Category {
  _id: string;
  name: string;
}
type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};
async function getCategoryData(categorySlug: string) {
  await connectDB();
  console.log("Searching for category with slug:", categorySlug); // <-- أضف هذا

  const category = await Category.findOne({
    slug: categorySlug,
  }).lean<Category>();
  if (!category) {
    notFound();
  }

  const posts = await Post.find({ category: category._id })
    .sort({ createdAt: -1 })
    .lean<PostType[]>();

  return { posts, categoryName: category.name };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params; // فكّ الـ Promise
  const { posts, categoryName } = await getCategoryData(resolvedParams.slug);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* قسم الترويسة */}
      <section className="text-center py-12 bg-slate-50 rounded-lg mb-12">
        <p className="text-lg font-semibold text-blue-600">Category</p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mt-2">
          {categoryName}
        </h1>
      </section>

      <h2 className="text-3xl font-bold mb-8 border-b pb-4">
        Posts in &quot;{categoryName}&quot;
      </h2>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          There are no posts in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              </CardContent>
              <div className="p-4 bg-gray-50 mt-auto">
                <Link
                  href={`/dashboard/postsSlug/${post.slug}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center"
                >
                  Read More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
