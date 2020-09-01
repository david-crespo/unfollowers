#! /app/.heroku/node/bin/node
"use strict";

const Twit = require("twit");

var T = new Twit({
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token: process.env.TW_TOKEN,
  access_token_secret: process.env.TW_SECRET,
  timeout_ms: 30 * 1000,
});

const fetchFollowers = () =>
  T.get("followers/ids", { stringify_ids: true })
    .then((r) => {
      if (r.errors) {
        throw Error(r.errors.map((e) => e.message).join("\n"));
      }
      console.log(`Current followers: ${r.data.ids && r.data.ids.length}`);
      return r.data.ids;
    })
    .catch((err) => {
      console.log("Error fetching followers:");
      console.log(err);
    });

const lookup = (ids) =>
  T.get("users/lookup", { user_id: ids.join(",") })
    .then((r) => r.data)
    .catch((e) => console.log("Error looking up follower details: ", e));

module.exports = { fetchFollowers, lookup };
