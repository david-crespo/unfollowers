#! /app/.heroku/node/bin/node
"use strict";

import * as redis from "./redis-helpers.js";
import * as twitter from "./twitter.js";
import { send as sendNotification } from "./notification.js";
import { commaSeries, setDiff } from "./utils.js";

async function checkUnfollowers() {
  const currFollowers = await twitter.fetchFollowers();
  const prevFollowers = await redis.getFollowers();

  await redis.setFollowers(currFollowers);
  await redis.quit();

  const unfollowers = setDiff(prevFollowers, currFollowers);
  console.log(`Found ${unfollowers.length} unfollowers`);

  if (unfollowers.length > 0) {
    const data = await twitter.lookup(unfollowers.slice(0, 100)); // twitter has max 100 lookup
    const screenNames = data.map((u) => `${u.name} (@${u.screen_name})`);
    sendNotification(`${commaSeries(screenNames)} unfollowed you.`);
  }
}

checkUnfollowers();
