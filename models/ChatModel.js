import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
    {
        users: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}]
    },
);

const ChatModel = mongoose.model("Chat", ChatSchema);
export default ChatModel;