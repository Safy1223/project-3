import connectDB from "@/lib/mongo";
import Post from "@/models/Post";
import { getServerSession } from "next-auth/next"; // استيراد getServerSession
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // استيراد authOptions
import { NextResponse } from "next/server";
import slugify from "slugify";
import Category from "@/models/Category";

type Props = {
  params: Promise<{
    categoryId: string;
  }>;
};
// --- PUT: تعديل فئة ---
export async function PUT(req: Request, { params }: Props) {
  const resolvedParams = await params;
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admins only" },
        { status: 403 }
      );
    }
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }
    const slug = slugify(name, { lower: true, strict: true });
    const updatedCategory = await Category.findByIdAndUpdate(
      resolvedParams.categoryId,
      { name, slug },
      { new: true } // تعيد الوثيقة المحدثة
    );
    if (!updatedCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { message: "Error updating category" },
      { status: 500 }
    );
  }
}
// --- DELETE: حذف فئة ---
export async function DELETE(req: Request, { params }: Props) {
  await connectDB();
  const resolvedParams = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admins only" },
        { status: 403 }
      );
    }
    // --- خطوة أمان مهمة ---
    // التحقق مما إذا كانت هناك أي منشورات تستخدم هذه الفئة
    //تُعيد عدد الوثائق التي تطابق الشرط Mongooseدالة من
    const postCount = await Post.countDocuments({
      category: resolvedParams.categoryId,
    });
    if (postCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete category. It is currently used by ${postCount} post(s).`,
        },
        { status: 409 } // 409 Conflict
      );
    }
    const deletedCategory = await Category.findByIdAndDelete(
      resolvedParams.categoryId
    );
    if (!deletedCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { message: "Error deleting category" },
      { status: 500 }
    );
  }
}
