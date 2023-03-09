import MessageModel from "../models/MessageModel.js";
import UserModel from "../models/User.js";

export const addMessage = async(req, res) => {
    const {chatId, senderId, text} = req.body;
    const toId = mongoose.Types.ObjectId;
    const message = new MessageModel({
        chatId,
        senderId,
        text
    });
    try {
        
        const result = await message.save();
        const sender = await UserModel.findById({id:senderId})
        if (sender.sex === "male") {
            await UserModel.findByIdAndUpdate({id: senderId}, {$inc:{coins: -1}});
            console.log(sender.coins);
        } else {
            console.log('something went wrong')
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

export const getMessages = async(req, res) => {
    const {chatId} = req.params;
    try {
        const result = await MessageModel.find({chatId});
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}