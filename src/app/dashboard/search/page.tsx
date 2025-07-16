"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, SearchX, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostType {
  _id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Failed to fetch search results.");
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="text-center py-10 bg-slate-50 rounded-lg mb-12 border">
        <p className="text-lg font-semibold text-blue-600">Search Results</p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mt-2">
          &quot;{query}&quot;
        </h1>
        <p className="mt-4 text-gray-600">
          Found {results.length} post(s) matching your search.
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <SearchX className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-2xl font-semibold">No Results Found</h2>
          <p className="mt-2 text-gray-500">
            We couldn&apos;t find any posts matching your search. Try a
            different keyword.
          </p>
        </div>
      ) : (
        // --- تعديل: استخدام تصميم بطاقات مشابه للصفحة الرئيسية ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((post) => (
            <Card
              key={post._id}
              className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader>
                <Link href={`/posts/${post.slug}`}>
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
              <CardFooter className="flex justify-between items-center bg-gray-50 p-4 mt-auto">
                <span className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <Link href={`/dashboard/postsSlug/${post.slug}`}>
                  <Button variant="outline" size="sm">
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </main>
  );
}
