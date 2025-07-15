// app/dashboard/posts/[postId]/edit/page.tsx
"use client";

import { useState, useEffect, useTransition, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// تعريف الأنواع
interface PostData {
  title: string;
  content: string;
  category: string;
}
interface Category {
  _id: string;
  name: string;
}
type EditPostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default function EditPostPage({ params }: EditPostPageProps) {
  const resolvedParams = use(params);
  const { postId } = resolvedParams;
  const router = useRouter();
  const [post, setPost] = useState<PostData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetching, startFetching] = useTransition();
  const [isUpdating, startUpdating] = useTransition();

  // جلب البيانات الأولية
  useEffect(() => {
    startFetching(async () => {
      try {
        const [postRes, catRes] = await Promise.all([
          fetch(`/api/posts/${postId}`),
          fetch("/api/categories"),
        ]);
        if (!postRes.ok) throw new Error("Failed to fetch post data.");
        if (!catRes.ok) throw new Error("Failed to fetch categories.");
        const postData = await postRes.json();
        const catData = await catRes.json();
        setPost(postData);
        setCategories(catData);
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "Could not load data.");
      }
    });
  }, [postId, router]);

  // =================================================================
  // تعديل: دالة تحديث مدمجة ومبسطة
  // =================================================================
  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;

    if (!title || !content || !category) {
      toast.error("All fields are required.");
      return;
    }

    startUpdating(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/edit`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, category }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update post.");
        }

        toast.success("Post updated successfully!");
        router.push("/dashboard/posts");
        router.refresh();
      } catch (error) {
        const err = error as Error;
        toast.error(err.message);
      }
    });
  };

  if (isFetching || !post) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          {/* تعديل: استخدام onSubmit مباشرة */}
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              {/* تعديل: استخدام defaultValue بدلاً من value/onChange */}
              <Input
                id="title"
                name="title"
                defaultValue={post.title}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              {/* ملاحظة: Select لا يعمل مباشرة مع FormData، لذلك سنبقيه متحكمًا */}
              <Select
                name="category"
                defaultValue={post.category}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                defaultValue={post.content}
                className="h-60"
                disabled={isUpdating}
              />
            </div>

            <Button type="submit" disabled={isUpdating} className="w-full">
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update Post"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
