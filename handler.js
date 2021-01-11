"use strict";

const s3 = require("./src/s3.js");
const twitter = require("./src/twitter.js");
const notification = require("./src/notification.js");
const { commaSeries, setDiff } = require("./src/utils.js");

module.exports.run = async () => {
  const currFollowers = await twitter.fetchFollowers();
  const prevFollowers = await s3.getFollowers();

  await s3.setFollowers(currFollowers);

  const unfollowers = setDiff(prevFollowers, currFollowers);
  console.log(`Found unfollowers: [${unfollowers.join(", ")}]`);

  if (unfollowers.length > 0) {
    const users = await twitter.lookup(unfollowers.slice(0, 100)); // twitter has max 100 lookup
    const screenNames = users.map((u) => `${u.name} (@${u.screen_name})`);

    const msg =
      users.length === 0
        ? `${unfollowers.length} followers no longer exist`
        : `${commaSeries(screenNames)} unfollowed you`;

    await notification.send(msg);
  }
};
