import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
      text: {
        type:String,
      },
      chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }  
    },
);

const MessageModel = mongoose.model("message", MessageSchema)
export default MessageModel;