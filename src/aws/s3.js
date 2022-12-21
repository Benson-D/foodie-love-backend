"use strict";

const dotenv = require("dotenv");
const AWS = require("aws-sdk");
const fs = require("fs");

dotenv.config();

const bucketName = process.env.BUCKET;
const region = process.env.BUCKET_REGION;

AWS.config.update({ region });

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
});

/**
 * Upload file path to aws s3 bucket, returns a url path to store in database
 * @param {*} file 
 * @return { Promise<string> } JSON 
 */
async function uploadRecipeImage(file) {
   if(!file) return;

    console.debug({ file }, "debug file case");

    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.originalname
    }

    const imageUrl = await s3.upload(uploadParams, function(err) {
        if (err) throw Error(err) 

    }).promise(); 

    return imageUrl.Location;
}

/**
 * Downloads a file directly from s3
 * @param {*} fileKey 
 * @returns 
 */
function getRecipeImage(fileKey) {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }

    return s3.getObject(downloadParams).createReadStream();
}

module.exports = {
    uploadRecipeImage,
    getRecipeImage
};