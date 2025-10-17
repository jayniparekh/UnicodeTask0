import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
    try {
        if(!filePath) throw new Error("File path is required");
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        })
        console.log("File uploaded successfully ", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(filePath); // will delete the file from local uploads folder
        console.error("Error uploading file to Cloudinary", error);
            throw error;
        }
    }
    
    export default uploadToCloudinary;