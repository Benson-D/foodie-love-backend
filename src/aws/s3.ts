import dotenv from "dotenv";
import AWS from "aws-sdk";
import fs from "fs";

dotenv.config();

const bucketName: string = process.env?.BUCKET ? process.env.BUCKET : '';
const region = process.env.BUCKET_REGION;

AWS.config.update({ region });

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
});

/**
 * Upload file path to aws s3 bucket, returns a url path to store in database
 * @param {Express.Multer.File} file - The file to upload
 * @return { Promise<string> } JSON 
 */
async function uploadImageToS3(file: Express.Multer.File): Promise<string> {
	if(!file) return '';
 
	 console.debug({ file }, "debug file case");
 
	 const fileStream = fs.createReadStream(file.path);
 
	 const uploadParams: AWS.S3.PutObjectRequest = {
		 Bucket: bucketName,
		 Body: fileStream,
		 Key: file.originalname as string
	 }
 
	 try {
		const imageUrl = await s3.upload(uploadParams).promise();
		return imageUrl.Location;
	 } catch (err) {
		throw new Error(`Error uploading file: ${(err as Error).message}`);
	 }
}

/**
 * Downloads a file directly from s3
 * @param {string} fileKey 
 * @returns {NodeJS.ReadableStream} - A readable stream of the downloaded file
 */
function getRecipeImage(fileKey: string): NodeJS.ReadableStream  {
    const downloadParams: AWS.S3.GetObjectRequest = {
        Key: fileKey,
        Bucket: bucketName as string
    }

    return s3.getObject(downloadParams).createReadStream();
}

export {
	uploadImageToS3,
	getRecipeImage
}