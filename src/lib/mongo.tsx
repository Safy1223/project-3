import mongoose, { Mongoose } from "mongoose";
declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}
const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

//تهيئة متغير لاستخدامه في التخزين المؤقت للاتصال
let cached = global.mongoose; // متاح في كل مكان. Node.js وهو كائن عام في global هنا بنستخدم
//حتى لا ننشئ اتصال جديد كل مرة يتم استيراد هذا الملف أو استدعاء الدالة. global.mongoose الفكرة هي تخزين الاتصال بقاعدة البيانات في
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  //إذا كان هناك اتصال موجود (تم إنشاؤه سابقاً) يعيد هذا الاتصال مباشرة بدون محاولة إنشاء اتصال جديد
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  //إذا لم يكن هناك اتصال أو محاولة اتصال قائمة، نبدأ عملية الاتصال
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
    console.log("MongoDB connected successfully");
  }
  //cached.conn ننتظر انتهاء الاتصالثم نخزن الاتصال النهائي في
  cached.conn = await cached.promise;
  return cached.conn;
}
export default connectDB;
