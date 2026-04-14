import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  clientId: string;
  clientName: string;
  message: string;
  type: "text" | "image" | "sticker";
  sender: "client" | "admin";
  read: boolean;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  clientId:   { type: String, required: true, index: true },
  clientName: { type: String, required: true },
  message:    { type: String, required: true },
  type:       { type: String, enum: ["text", "image", "sticker"], default: "text" },
  sender:     { type: String, enum: ["client", "admin"], required: true },
  read:       { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
