#! /app/.heroku/node/bin/node
"use strict";

import * as redisHelpers from "./redis-helpers.js";
import * as twitter from "./twitter.js";
import { send as sendNotification } from "./notification.js";
import { commaSeries, setDiff } from "./utils.js";

async function checkUnfollowers() {
  let followers, oldFollowers;
  try {
    followers = await twitter.fetchFollowers();
    oldFollowers = await redisHelpers.retrieveOldFollowers();
  } catch {
    redisHelpers.quit();
    return;
  }

  if (followers && followers.length) {
    await redisHelpers.saveFollowers(followers);
    await redisHelpers.quit();
  }

  console.log(
    `Found ${followers.length} followers (previously ${oldFollowers.length})`,
  );

  const unfollowers = setDiff(oldFollowers, followers);
  console.log(`Found ${unfollowers.length} unfollowers`);

  if (unfollowers.length > 0) {
    const data = await twitter.lookup(unfollowers.slice(0, 100)); // twitter has max 100 lookup
    const screenNames = data.map((u) => `${u.name} (@${u.screen_name})`);
    const msg = commaSeries(screenNames);
    sendNotification(`${msg} unfollowed you.`);
  }
}

checkUnfollowers();
