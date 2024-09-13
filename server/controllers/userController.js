import StudentModel from "../models/userModel.js";

import { listObjectsFromS3 } from "../middlewares/upload-multer.js";
import { getObjectFromS3 } from "../middlewares/upload-multer.js";
// import { uploadToS3 } from "../middlewares/upload-multer.js";



export const createUser = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("emaill....", req.body);
    // const s3Objects = await uploadToS3();
    // console.log("object....save",s3Objects)
    const studentProfile = new StudentModel({
      email: email,
      file: req.file.originalname // Assuming you want to save the filename
    });


    // Save the student profile to the database
    const savedProfile = await studentProfile.save();
    res.status(201).json(savedProfile); // Respond with the saved profile
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




export const getAllData = async (req, res) => {
  try {
    const candidates = await StudentModel.find();
    console.log("candiadate....",candidates)
    // Fetch bucket objects from S3
    const s3Objects = await listObjectsFromS3();
    
    res.status(200).send({ status: "success", candidates: candidates, s3Objects: s3Objects  });
  } catch (error) {
    console.log(error);
  }
};







// getUser function that retrieves user data from MongoDB and fetches the corresponding profile image from S3
export const getUser = async (req, res) => {
  try {
    // Fetch user data from MongoDB (assuming you have a Student model)
    const candidates = await StudentModel.findById(req.params.userId);
    console.log("cand.....",candidates)

    if (!candidates) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Construct the S3 key for the user's profile image
    // const key = `profiles/${candidates._id}/profile.jpg`; // Example key format

    // Fetch the user's profile image from S3
    const profileImage = await getObjectFromS3(key);
    console.log("profile img....",profileImage)

    // Return user data along with the profile image
    res.status(200).json({ status: "success", candidates: candidates, profileImage: profileImage });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
