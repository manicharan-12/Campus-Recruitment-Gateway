const { S3_PATHS } = require("../config/s3Config");
const AWS = require("aws-sdk");

const deleteFromS3 = async (fileUrl) => {
  const key = fileUrl.split("/").pop();
  console.log(key);

  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${S3_PATHS.UNIVERSITY.LOGO}/${key}`,
  };

  return new AWS.S3().deleteObject(deleteParams).promise();
};

module.exports = { deleteFromS3 };
