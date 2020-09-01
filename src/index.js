#! /app/.heroku/node/bin/node
"use strict";

import * as redisHelpers from "./redis-helpers.js";
import * as twitter from "./twitter.js";
import { send as sendNotification } from "./notification.js";
import { commaSeries } from "./utils.js";

Promise.all([twitter.fetchFollowers(), redisHelpers.retrieveOldFollowers()])
  .then(([followers, oldFollowers]) => {
    if (followers && followers.errors) {
      // usually rate limiting
      console.log("Error fetching followers:");
      console.log(followers.errors.map((e) => e.message).join("\n"));
      return;
    }

    if (followers && followers.length && oldFollowers && oldFollowers.length) {
      console.log(
        `Found ${followers.length} followers (previously ${oldFollowers.length})`,
      );

      const followersSet = new Set(followers);
      const unfollowerIDs = oldFollowers.filter((f) => !followersSet.has(f));
      console.log(`Found ${unfollowerIDs.length} unfollowers`);

      if (unfollowerIDs.length) {
        const first100 = unfollowerIDs.slice(0, 100); // twitter has max 100 lookup
        return twitter
          .lookup(first100)
          .then((unfollowers) => {
            const screenNamesStr = commaSeries(
              unfollowers.map((u) => `${u.name} (@${u.screen_name})`),
            );
            sendNotification(`${screenNamesStr} unfollowed you.`);
          })
          .finally(() => redisHelpers.saveFollowers(followers));
      }
    }

    return redisHelpers.saveFollowers(followers);
  })
  .catch((err) => console.log(err))
  .finally(() => redisHelpers.quit());
