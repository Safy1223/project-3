"use client";
import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react"; // لاستخدام useSession
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Session } from "next-auth";
interface CommentType {
  _id: string;
  content: string;
  author: {
    _id: string;
    username?: string;
    email: string;
  };
  createdAt: string;
}
interface CommentSectionProps {
  postId: string;
  session: Session | null;
}
export default function CommentSection({
  postId,
  session,
}: CommentSectionProps) {
  const { data: clientSession } = useSession();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isDeleting, startDeleting] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const [isFetching, startFetching] = useTransition();
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  // دالة لجلب التعليقات جلب التعليقات عند تحميل المكون
  useEffect(() => {
    startFetching(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        if (!res.ok) throw new Error("Failed to fetch comments.");
        const data = await res.json();
        setComments(data);
      } catch {
        toast.error("Could not load comments.");
      }
    });
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    if (!clientSession) {
      // التحقق من الجلسة من جانب العميل
      toast.error("You must be logged in to comment.");
      return;
    }

    startSubmitting(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newCommentContent }),
        });
        const newComment = await res.json();
        if (!res.ok) {
          throw new Error(newComment.message || "Failed to add comment.");
        }
        toast.success("Comment added successfully!");
        // const addedComment: CommentType = await res.json();
        setComments((prev) => [...prev, newComment]);
        setNewCommentContent("");
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "An unexpected error occurred.");
        console.error("Error adding comment:", err);
      }
    });
  };

  const handleCommentDelete = async (commentId: string) => {
    setDeletingCommentId(commentId);
    startDeleting(async () => {
      try {
        const res = await fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to delete comment.");
        }
        toast.success("Comment deleted successfully!");
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentId)
        );
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "An unexpected error occurred.");
      } finally {
        setDeletingCommentId(null); // إيقاف مؤشر التحميل
      }
    });
  };
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments ({comments.length})</h2>
      {isDeleting && (
        <div className="text-sm text-gray-500 mb-2">Deleting comment...</div>
      )}
      {/* نموذج إضافة تعليق */}
      {session ? ( // استخدم الجلسة التي تم تمريرها من Server Component لتحديد ما إذا كان المستخدم مسجلاً للدخول
        <form onSubmit={handleAddComment} className="mb-6 ">
          {/* <h3 className="text-lg font-semibold mb-2">Add a Comment</h3> */}
          <Textarea
            placeholder="Write your comment here..."
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            rows={3}
            className="mb-2"
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting} className="w-32">
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit"}
          </Button>
        </form>
      ) : (
        <Alert className="mb-6">
          {/* <AlertTitle>Login to Comment</AlertTitle> */}
          <AlertDescription>
            {/* You must be logged in to add comments.{" "} */}
            <Link href="/login" className="font-semibold hover:underline">
              Sign In
            </Link>{" "}
            to add a comment.
            {/* <Link href="/signup" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
            . */}
          </AlertDescription>
        </Alert>
      )}

      {/* قائمة التعليقات */}
      {/* والتعليقات لسا ما وصلت. يعرض  loading true الحالة الاولى لما يكون */}
      {isFetching ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-gray-400" size={24} />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 py-4">Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-3">
              <div className="flex-1 border p-4 rounded-lg bg-white">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">
                    {comment.author?.username || comment.author?.email}
                  </p>

                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-gray-800 mt-2">{comment.content}</p>
              </div>

              {session && session.user.id === comment.author._id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingCommentId === comment._id}
                      className="text-gray-500 hover:text-red-500 mt-2"
                    >
                      {deletingCommentId === comment._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your comment. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCommentDelete(comment._id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
