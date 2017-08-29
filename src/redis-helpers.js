#! /app/.heroku/node/bin/node
"use strict";

const Promise = require("bluebird");
const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);

const FOLLOWERS_KEY = 'followers';

const createClient = () => redis.createClient(process.env.REDIS_URL);

const retrieveOldFollowers = client => (
  client
    .getAsync(FOLLOWERS_KEY)
    .then(result => result ? result.split(',') : null)
);

const saveFollowers = client => (followerIDs=[]) => {
  console.log(`Saving ${followerIDs.length} followers to redis`);
  return client.setAsync(FOLLOWERS_KEY, followerIDs.join(','))
};

module.exports = {
  createClient,
  retrieveOldFollowers,
  saveFollowers
};
