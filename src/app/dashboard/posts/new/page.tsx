"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
}
type postType = {
  title: string;
  content: string;
  category: string;
};
const CreatePostPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [post, setPost] = useState<postType>({
    title: "",
    content: "",
    category: "",
  });
  // const [categoryId, setCategoryId] = useState(""); // حالة لتخزين معرف الفئة المختارة
  const [categories, setCategories] = useState<Category[]>([]); // حالة لتخزين قائمة الفئات
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        } else {
          setError("Failed to load categories.");
        }
      } catch {
        setError("An error occurred while fetching categories.");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!post.title || !post.content || !post.category) {
      setError("Title, content, and category are required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          category: post.category,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        alert("The blog was created✅");
        setPost({ title: "", content: "", category: "" });
      } else {
        alert(data.error || "An error occurred.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" className="mb-2">
            Title
          </Label>
          <Input
            id="title"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="content" className="mb-2">
            Content
          </Label>
          <Textarea
            id="content"
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            rows={10}
            disabled={loading}
          />
        </div>
        {/* --- قائمة الفئات المنسدلة --- */}
        <div>
          <Label htmlFor="category" className="mb-2">
            Category
          </Label>
          <Select
            onValueChange={(value) =>
              setPost((prev) => ({ ...prev, category: value }))
            }
            value={post.category}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Post"}
        </Button>
      </form>
    </div>
  );
};
export default CreatePostPage;
