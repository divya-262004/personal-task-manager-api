import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import s3Client from '../config/s3Client.js';
import config from '../config/config.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const uploadFile= async ({key, body, contentType})=>{
  try {
    const command= new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);
  } catch (error) {
    logger.error('S3 file upload failed', {
      error: error.message,
      key,
    });

    throw new AppError('Failed to upload file', 500);
  }
};

const deleteFile = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    logger.error('S3 file deletion failed', {
      error: error.message,
      key,
    });

    throw new AppError('Failed to delete file', 500);
  }
};

const getDownloadUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });
  } catch (error) {
    logger.error('S3 download URL generation failed', {
      error: error.message,
      key,
    });

    throw new AppError(
        'Failed to generate download URL',
        500,
    );
  }
};

const fileExists = async (key) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }

    logger.error('S3 file existence check failed', {
      error: error.message,
      key,
    });

    throw new AppError('Failed to check file availability', 500);
  }
};

export {
  uploadFile,
  deleteFile,
  getDownloadUrl,
  fileExists,
};
