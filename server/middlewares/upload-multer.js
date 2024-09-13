import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import multer from "multer";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 Client with credentials from .env
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `profile`);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage: storage });

// Function to upload file to S3
export const uploadToS3 = async (req, res, next) => {
  console.log("fileee....", req.file);
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const fileContent = fs.readFileSync(req.file.path);
    console.log("file content....", fileContent);

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME, 
      Key: req.file.originalname,
      Body: fileContent,
      ACL: "public-read",
      ContentType: "image/jpeg",
    };

    const command = new PutObjectCommand(uploadParams);
    const response = await s3Client.send(command);

    next(); 
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Generate a pre-signed URL for a specific key
const generatePreSignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: "image/jpeg"
  });
  const url = await getSignedUrl(s3Client, command);
  return url;
}

// List all objects in the S3 bucket
export const listObjectsFromS3 = async () => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
    };

    const listObjectsCommand = new ListObjectsV2Command(params);
    const response = await s3Client.send(listObjectsCommand);
    const objectKeys = response.Contents.map((object) => object.Key);

    const preSignedUrls = await Promise.all(
      objectKeys.map(async (key) => {
        return generatePreSignedUrl(key);
      })
    );

    console.log("URLs....", preSignedUrls);
    return preSignedUrls;
  } catch (error) {
    console.error("Error listing objects from S3:", error);
    throw error;
  }
};

// Delete an object from S3
export const deleteObject = async (req, res) => {
  try {
    const { filename } = req.params;
    const command = new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: filename });
    await s3Client.send(command);
    res.send("File Deleted Successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Update an object in S3
export const updateObject = async (req, res) => {
  console.log("fileee....", req.file);

  try {
    const { filename } = req.params;
    console.log("filename.....", filename);

    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const image = req.file;
    console.log("file....", image);

    const imageData = fs.readFileSync(image.path);

    const putObjectParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Body: imageData,
      ContentType: "image/jpeg"
    };
    const putObjectCommand = new PutObjectCommand(putObjectParams);
    const data = await s3Client.send(putObjectCommand);

    res.send({ message: "Updated successfully", data });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).send("Error updating image");
  }
}

// Retrieve a single object from S3
export const getObjectFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    const objectData = response.Body.toString('utf-8');
    return objectData;
  } catch (error) {
    console.error("Error retrieving object from S3:", error);
    throw error;
  }
};
