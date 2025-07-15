"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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

type DeleteFormProps = {
  postId: string;
  postTitle: string;
};
export default function DeleteFormWithConfirmation({
  postId,
  postTitle,
}: DeleteFormProps) {
  const router = useRouter(); // تهيئة useRouter
  const [isDeleting, startDeleting] = useTransition();

  const handleDelete = async () => {
    startDeleting(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/delete`, {
          method: "DELETE", // <-- هنا نحدد نوع الطلب DELETE
        });
        if (res.ok) {
          toast.success("Post deleted successfully!");
          router.refresh();
        } else {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to delete post.");
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "An error occurred.");
      }
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="cursor-pointer"
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the post
            titled <span className="font-bold">&quot;{postTitle}&quot;</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Yes, delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
