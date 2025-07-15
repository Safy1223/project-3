import mongoose, { model, models, Types } from "mongoose";
import "./User"; // <-- استيراد لضمان تسجيل نموذج User
import "./Category"; // <-- استيراد لضمان تسجيل نموذج Category
import "./Comment"; // <-- استيراد لضمان تسجيل نموذج Comment

interface IPost {
  title: string;
  content: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comments: Types.ObjectId[];
  slug: string;
  likes: Types.ObjectId[];
  category: Types.ObjectId;
}

const postSchema = new mongoose.Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //مصفوفة من مراجع التعليقات
    //هذا الحقل سيخزن مصفوفة من معرفات التعليقات التي تنتمي إلى هذا المنشور. هذا يسمح لنا بجلب جميع التعليقات الخاصة بمنشور معين بسهولة.
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    slug: {
      type: String,
      required: true,
      unique: true, // يجب أن يكون فريدًا
      lowercase: true, // يحول إلى أحرف صغيرة
      trim: true, // يزيل المسافات البيضاء من البداية والنهاية
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // مصفوفة من معرفات المستخدمين الذين أعجبوا بالمنشور
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  //عند حفظ أي وثيقة جديدة أو تعديل وثيقة موجودة، سيتم تحديث هذه الحقول تلقائيًا بدون الحاجة لكتابة كود إضافي.
  //createdAt , updatedAt
  { timestamps: true }
);
//models:  يحتوي على كل النماذج اللي تم تعريفهاobject هو كائن
//model: "جديدmodel تعريف "
//فأنشئ واحد وخزنه Post هنا بهذا المتغير اذا مافي موديل من نوع
const Post = models.Post || model<IPost>("Post", postSchema);

export default Post;
