#! /app/.heroku/node/bin/node
"use strict";

import redis from "redis";
import { promisify } from "util";

const FOLLOWERS_KEY = "followers";

const client = redis.createClient(process.env.REDIS_URL);

const get = promisify(client.get).bind(client);
const set = promisify(client.set).bind(client);
export const quit = promisify(client.quit).bind(client);

export const getFollowers = () =>
  get(FOLLOWERS_KEY)
    .then((result) => {
      const followers = result ? result.split(",") : null;
      console.log(`Previous followers: ${followers && followers.length}`);
      return followers;
    })
    .catch((e) => console.log("Error retrieving followers from redis:", e));

export const setFollowers = (followerIDs = []) => {
  console.log(`Saving ${followerIDs.length} followers to redis`);
  return set(FOLLOWERS_KEY, followerIDs.join(",")).catch((e) =>
    console.log("Error saving followers in redis:", e),
  );
};
