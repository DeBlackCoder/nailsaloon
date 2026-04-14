import mongoose, { Schema, Document } from "mongoose";
export interface IRecentWork extends Document { title: string; description: string; imageUrl: string; serviceType?: string; price?: string; likes: number; createdAt: Date; }
const RecentWorkSchema = new Schema<IRecentWork>({
  title: { type: String, required: true }, description: { type: String, required: true },
  imageUrl: { type: String, required: true }, serviceType: { type: String }, price: { type: String },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.models.RecentWork || mongoose.model<IRecentWork>("RecentWork", RecentWorkSchema);
