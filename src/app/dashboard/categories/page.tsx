"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // استيراد مكونات Dialog

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
} from "@/components/ui/alert-dialog"; // استيراد Alert Dialog

import { Edit, Trash2, Loader2 } from "lucide-react"; // استيراد أيقونات
import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast"; // يجب تثبيت هذه المكتبة, استيراد toast

interface Category {
  _id: string;
  name: string;
}
export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // استخدام useTransition لحالات تحميل منفصلة وأكثر كفاءة
  const [isFetching, startFetching] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isUpdating, startUpdating] = useTransition();

  useEffect(() => {
    startFetching(async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to load categories.");
        const data = await res.json();
        setCategories(data);
      } catch {
        toast.error("Could not fetch categories.");
      }
    });
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    startSubmitting(async () => {
      try {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategoryName }),
        });
        const newCategory = await res.json();
        if (!res.ok) {
          throw new Error(newCategory.message || "Failed to add category.");
        }
        toast.success("Category added successfully!");
        setCategories((prev) => [...prev, newCategory]);
        setNewCategoryName("");
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "An unexpected error occurred.");
      }
    });
  };
  // تعديل فئة
  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    //setError(null);
    startUpdating(async () => {
      try {
        const res = await fetch(`/api/categories/${editingCategory._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editingCategory.name }),
        });
        const updatedCategory = await res.json();
        if (!res.ok) {
          throw new Error(
            updatedCategory.message || "Failed to update category."
          );
        }
        toast.success("Category updated successfully!");
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === updatedCategory._id ? updatedCategory : cat
          )
        );
        // إغلاق مربع الحوار يتطلب الوصول إلى حالته، الأسهل هو استخدام DialogClose
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "An unexpected error occurred.");
      }
    });
  };

  // حذف فئة
  const handleDeleteCategory = async (categoryId: string) => {
    startDeleting(async () => {
      try {
        const res = await fetch(`/api/categories/${categoryId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const errorData = await res.json();
          setDeleteError(errorData.message || "Failed to delete category.");
          return;
        }
        toast.success("Category deleted successfully!");
        setCategories((prev) => prev.filter((cat) => categoryId !== cat._id));
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "An unexpected error occurred.");
      }
    });
  };
  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 md:p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
      </div>

      {/* نموذج إضافة فئة */}
      <div className="mb-8">
        <form
          onSubmit={handleAddCategory}
          className="p-4 border rounded-lg bg-slate-50"
        >
          <Label htmlFor="new-category" className="text-base font-semibold">
            Add New Category
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="new-category"
              placeholder="e.g., Web Development"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting} className="w-28">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Add"}
            </Button>
          </div>
        </form>
      </div>

      {/* قائمة الفئات الحالية */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>
        {isFetching ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm"
              >
                <span className="font-medium">{category.name}</span>
                <div className="flex items-center">
                  {/* --- زر التعديل --- */}
                  <Dialog
                    onOpenChange={(isOpen) =>
                      !isOpen && setEditingCategory(null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCategory({ ...category })}
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="edit-category-name" className="mb-2">
                          Category Name
                        </Label>
                        <Input
                          id="edit-category-name"
                          value={editingCategory?.name || ""}
                          onChange={(e) =>
                            setEditingCategory((prev) =>
                              prev ? { ...prev, name: e.target.value } : null
                            )
                          }
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            onClick={handleEditCategory}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* --- زر الحذف --- */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the
                          <span className="font-bold">
                            {" "}
                            &quot;{category.name}&quot;{" "}
                          </span>{" "}
                          category.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category._id)}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Yes, delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* عرض رسالة خطأ */}
                  <AlertDialog
                    open={!!deleteError}
                    onOpenChange={() => setDeleteError(null)}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">
                          Deletion Failed
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {deleteError}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setDeleteError(null)}>
                          OK
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
