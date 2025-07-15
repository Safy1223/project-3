import mongoose, { model, models, Types } from "mongoose";
import "./User"; // <-- استيراد لضمان تسجيل نموذج User
interface IComment {
  content: string;
  // يُستخدم لربط المستندات ببعضها MongoDB  وهو نوع خاص من المعرفات الفريدة في ObjectId أن هذا الحقل من نوع Mongoose  هذا يُخبر
  //لخاص بوثيقة أخرى (مثل مستخدم). (_id) يعني: هذا الحقل لا يخزن بيانات نصية أو رقمية، بل يخزن المعرف
  author: Types.ObjectId;
  post: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const commentSchema = new mongoose.Schema<IComment>(
  {
    content: { type: String, required: true, trim: true },
    author: {
      // الذي ينتمي إليه التعليق. هذا يربط التعليق بالمنشور الصحيح Post مرجع إلى
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // هذا يسمح لنا بمعرفة من قام بالتعليق مرجع إلى نموذج المستخدم
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);
const Comment = models.Comment || model<IComment>("Comment", commentSchema);
export default Comment;
