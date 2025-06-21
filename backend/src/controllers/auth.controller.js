import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  // get the request body
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res
        .status(422)
        .json({ message: "Please fill up all input fields." });
    }

    // check the length of password
    if (password.length < 6) {
      return res
        .status(422)
        .json({ message: "Password must be at least 6 characters." });
    }

    // check for the email in the DB
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "Email is already exist.",
      });
    }

    // create salt
    const salt = await bcrypt.genSalt(10);
    // encrypt the readable password
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      // DEFAULT: fullName: fullName,
      // SHORTCUT: fullName,
      fullName: fullName,
      email: email,
      password: hashPassword,
    });

    if (newUser) {
      //generate JWT token
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({
        message: "Invalid User Data.",
      });
    }
  } catch (error) {
    console.log("Error in signup controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const login = async (req, res) => {
  // create request variable
  const { email, password } = req.body;

  try {
    // check if the input fields is filled
    if (!email || !password) {
      return res
        .status(422)
        .json({ message: "Please fill up all input fields." });
    }

    // check if the user's email exist in DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials." });
    }

    // check if the password match
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials." });
    }

    //generate new token for login
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const logout = (req, res) => {
  try {
    //replace the token as cookie that expried immediately
    res.cookie("jwt", "", { maxAge: 0 });

    res.status(200).json({ message: "Logged out Successfully." });
  } catch (error) {
    console.log("Error in logout controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(422).json({ message: "Profile pic is required." });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findOneAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller: ", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};
