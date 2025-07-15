import mongoose, { model, models, Types } from "mongoose";

interface IUser {
  username: string;
  email: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordExpire: Date;
  createdAt: Date;
  updatedAt: Date;
  likedPosts: Types.ObjectId[];
  role: string;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String, //لتخزين الرمز المميز لإعادة تعيين كلمة المرور
    resetPasswordExpire: Date, //لتخزين وقت انتهاء صلاحية الرمز المميز
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], //هذا الحقل سيخزن مصفوفة من معرفات المنشورات التي قام المستخدم بالإعجاب بها.
    role: {
      type: String,
      enum: ["user", "admin"], //يحدد الأدوار المسموح بها
      default: "user", // الدور الافتراضي لأي مستخدم جديد
    },
  },
  { timestamps: true }
);
//models:  يحتوي على كل النماذج اللي تم تعريفهاobject هو كائن
//model: "جديدmodel تعريف "
//فأنشئ واحد وخزنه Post هنا بهذا المتغير اذا مافي موديل من نوع
const User = models.User || model<IUser>("User", UserSchema);

export default User;
