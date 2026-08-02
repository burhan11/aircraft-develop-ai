import { getDestination } from "@sap-cloud-sdk/connectivity";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import cds from "@sap/cds";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getAWSCredentials = async () => {
  const awsS3Destination = await getDestination({
    destinationName: "AWS_S3",
  });
  if (
    !awsS3Destination?.username ||
    !awsS3Destination.password ||
    !awsS3Destination?.originalProperties?.region ||
    !awsS3Destination?.originalProperties?.bucket
  ) {
    throw new Error("Startup Error: Missing AWS credentials");
  }
  return {
    s3: new S3Client({
      credentials: {
        accessKeyId: awsS3Destination.username,
        secretAccessKey: awsS3Destination.password,
      },
      region: awsS3Destination.originalProperties.region,
    }),
    bucket: awsS3Destination.originalProperties.bucket,
  };
};

export const initAWS = async () => {
  if (cds.env.production) {
    return getAWSCredentials();
  } else {
    return getAWSEnv();
  }
};

export const uploadToStorage = async (
  s3: S3Client,
  bucket: string,
  id: string,
  image: string,
  mimeType: string
) => {
  const params = {
    Bucket: bucket,
    Key: id,
    Body: Buffer.from(image.replace(/^data:[^;]+;base64,/, ""), "base64"),
    ContentType: mimeType,
  };
  const uploadCommand = new PutObjectCommand(params);
  await s3.send(uploadCommand);
};

export const getS3ImageUrl = (bucket: string, id: string) => {
  return `https://${bucket}.s3.amazonaws.com/${id}`;
};

const getAWSEnv = () => {
  return {
    s3: new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_S3_SECRET_KEY ?? "",
      },
      region: process.env.AWS_S3_REGION,
    }),
    bucket: process.env.AWS_S3_BUCKET,
  };
};

export const getSignedS3ImageUrl = async (
  s3: S3Client,
  bucket: string,
  productID: string
) => {
  const generateUrlCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: productID,
  });
  const url = await getSignedUrl(s3, generateUrlCommand, {
    expiresIn: 6000,
  });
  return url;
};

export const deleteS3Element = async (
  s3: S3Client,
  bucket: string,
  productID: string
) => {
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: bucket,
    Key: productID,
  });
  await s3.send(deleteObjectCommand);
};

export const isValidHttpUrl = (url: string) => {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return !!pattern.test(url);
};
