import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongo";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function GET() {
  await connectDB();
  try {
    const categories = await Category.find().sort({ name: 1 }); // // ترتيب أبجدي
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Error fetching categories" },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // التحقق من وجود الفئة بالفعل
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 }
      ); // 409 Conflict
    }
    // إنشاء slug
    const slug = slugify(name, { lower: true, strict: true });
    const newCategory = new Category({ name, slug });
    await newCategory.save();
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { message: "Error creating category" },
      { status: 500 }
    );
  }
}
