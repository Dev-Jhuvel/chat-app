import cloudinary from "cloudinary";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.userId;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password"); //$ne = not equal

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in the getUserForSidebar controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: friendId } = req.params;
    const myId = req.user._id;

    // get messages the user send and received with the friend user
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: friendId },
        { senderId: friendId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in the getMessage controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // check if the is image in the message
    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    
    // add this message model to the database
    await newMessage.save();

    //TODO: Real time functionality goes here => socket.io

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in the sendMessage controller: ", error.message);
    res.status(500).json({error: "Internal Server Error."})
  }
};
