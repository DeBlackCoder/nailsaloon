import mongoose, { Schema, Document } from "mongoose";

export interface IWorkComment extends Document {
  workId: string;
  name: string;
  message: string;
  likes: number;
  adminReply?: string;
  createdAt: Date;
}

const WorkCommentSchema = new Schema<IWorkComment>({
  workId:     { type: String, required: true, index: true },
  name:       { type: String, required: true },
  message:    { type: String, required: true },
  likes:      { type: Number, default: 0 },
  adminReply: { type: String },
}, { timestamps: true });

export default mongoose.models.WorkComment || mongoose.model<IWorkComment>("WorkComment", WorkCommentSchema);
