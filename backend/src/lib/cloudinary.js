import { v2 as cloudinary } from "cloudinary";  
import dotenv from "dotenv"; 

// use this so we can use the data on the env file
dotenv.config();

// setup the cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
