#! /app/.heroku/node/bin/node
"use strict";

const Promise = require("bluebird");
const redisHelpers = require('./redis-helpers');

const twitter = require('./twitter');
const sendNotification = require('./notification').send;
const commaSeries = require('./utils').commaSeries;

const redisClient = redisHelpers.createClient();

Promise.all([twitter.fetchFollowers(), redisHelpers.retrieveOldFollowers(redisClient)])
  .then(([followers, oldFollowers]) => {
    if (followers && followers.errors) {  // usually rate limiting
      console.log('Error fetching followers:');
      console.log(followers.errors.map(e => e.message).join('\n'));
      return;
    }

    if (followers && followers.length && oldFollowers && oldFollowers.length) {
      console.log(`Found ${followers.length} followers (previously ${oldFollowers.length})`);

      const followersSet = new Set(followers);
      const unfollowerIDs = oldFollowers.filter(f => !followersSet.has(f));
      console.log(`Found ${unfollowerIDs.length} unfollowers`);

      if (unfollowerIDs.length) {
        const first100 = unfollowerIDs.slice(0, 100); // twitter has max 100 lookup
        return twitter.lookup(first100)
          .then(unfollowers => commaSeries(unfollowers.map(u => `${u.name} (@${u.screen_name})`)))
          .then(screenNamesStr => sendNotification(`${screenNamesStr} unfollowed you.`))
          .then(() => redisHelpers.saveFollowers(redisClient)(followers));
      }
    }

    return redisHelpers.saveFollowers(redisClient)(followers)
  })
  .catch(err => console.log(err))
  .finally(() => redisClient.quit());
