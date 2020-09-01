#! /app/.heroku/node/bin/node
"use strict";

import redis from "redis";
import { promisify } from "util";

const FOLLOWERS_KEY = "followers";

const client = redis.createClient(process.env.REDIS_URL);
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const quitAsync = promisify(client.quit).bind(client);

export const retrieveOldFollowers = () =>
  getAsync(FOLLOWERS_KEY).then((result) => {
    console.log({ result });
    return result ? result.split(",") : null;
  });

export const saveFollowers = (followerIDs = []) => {
  console.log(`Saving ${followerIDs.length} followers to redis`);
  return setAsync(FOLLOWERS_KEY, followerIDs.join(","));
};

export const quit = () => quitAsync();
