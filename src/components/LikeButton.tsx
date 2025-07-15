// components/LikeButton.tsx
"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react"; // أيقونة قلب جميلة

interface LikeButtonProps {
  postId: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
}

export default function LikeButton({
  postId,
  initialLikesCount,
  initialIsLiked,
}: LikeButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); //ما تعلّق الواجهة أثناء تنفيذها. React يُستخدم لتمييز التحديثات غير الضرورية والفورية حتى
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  const handleLikeClick = async () => {
    // إذا لم يكن المستخدم مسجلاً للدخول، قم بتوجيهه إلى صفحة تسجيل الدخول
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    //التحديث المتفائل
    // هو تحديث الواجهة مباشرة قبل ما تتأكد من استجابة الخادم   يعني بدل ما تنتظر الرد من السيرفر لتحديث الواجهة، أنت تفترض النجاح وتحدث الواجهة فورًا ثم إذا فشل الطلب ترجع للحالة القديمة.
    setIsLiked((prev) => !prev);
    setLikesCount((count) => (isLiked ? count - 1 : count + 1));

    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/like`, {
          method: "POST",
        });
        if (!res.ok) {
          // إذا فشل الطلب، قم بإعادة الواجهة إلى حالتها الأصلية
          setIsLiked(initialIsLiked);
          setLikesCount(initialLikesCount);
          console.error("Failed to update like status");
        }
        // else {
        //   // يمكنك تحديث الحالة من الخادم إذا أردت، ولكن التحديث المتفائل يكفي
        //   const data = await res.json();
        // }
      } catch (error) {
        // إذا فشل الطلب، قم بإعادة الواجهة إلى حالتها الأصلية
        setIsLiked(initialIsLiked);
        setLikesCount(initialLikesCount);
        console.error("Error liking post:", error);
      }
    });
  };
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLikeClick}
      disabled={isPending || status === "loading"}
      className="flex items-center gap-2"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          isLiked ? "text-red-500 fill-red-500" : "text-gray-500"
        }`}
      />
      <span>{likesCount}</span>
    </Button>
  );
}
