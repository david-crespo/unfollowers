"use strict";

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const DELIM = "\n";

const bucketParams = {
  Bucket: process.env.BUCKET,
  Key: "unfollower_ids.txt",
};

const setFollowers = async (followerIDs = []) => {
  console.log(`Saving ${followerIDs.length} follower IDs to S3`);
  const Body = followerIDs.join(DELIM);
  try {
    await s3.putObject({ ...bucketParams, Body }).promise();
  } catch (e) {
    console.log("Error writing to S3:", e);
  }
};

const getFollowers = async () => {
  try {
    const { Body } = await s3.getObject(bucketParams).promise();
    const followers = Body ? Body.toString("utf-8").split(DELIM) : [];
    console.log(`Previous followers: ${followers && followers.length}`);
    return followers;
  } catch (e) {
    console.log("Error reading from S3:", e);
    return [];
  }
};

module.exports = { setFollowers, getFollowers };
