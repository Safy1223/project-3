import { model, models, Schema } from "mongoose";

interface ICategory {
  name: string;
  slug: string;
}
const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true, unique: true },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
});
const Category =
  models.Category || model<ICategory>("Category", categorySchema);

export default Category;
