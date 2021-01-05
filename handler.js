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
  if (unfollowers.length === 0) {
    console.log("No unfollowers found");
  } else {
    console.log(
      `Found ${unfollowers.length} unfollowers: [${unfollowers.join(", ")}]`,
    );
    const data = await twitter.lookup(unfollowers.slice(0, 100)); // twitter has max 100 lookup
    if (data.length > 0) {
      const screenNames = data.map((u) => `${u.name} (@${u.screen_name})`);
      notification.send(`${commaSeries(screenNames)} unfollowed you.`);
    } else {
      notification.send(
        `${unfollowers.length} of your followers no longer exist.`,
      );
    }
  }
};
