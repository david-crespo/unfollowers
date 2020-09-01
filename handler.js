"use strict";

const s3 = require("./src/s3.js");
const twitter = require("./src/twitter.js");
const notification = require("./src/notification.js");
const { commaSeries, setDiff } = require("./src/utils.js");

module.exports.run = async (event, context) => {
  const currFollowers = await twitter.fetchFollowers();
  const prevFollowers = await s3.getFollowers();

  await s3.setFollowers(currFollowers);

  const unfollowers = setDiff(prevFollowers, currFollowers);
  console.log(`Found ${unfollowers.length} unfollowers`);

  if (unfollowers.length > 0) {
    const data = await twitter.lookup(unfollowers.slice(0, 100)); // twitter has max 100 lookup
    const screenNames = data.map((u) => `${u.name} (@${u.screen_name})`);
    notification.send(`${commaSeries(screenNames)} unfollowed you.`);
  }
};
