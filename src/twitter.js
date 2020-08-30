#! /app/.heroku/node/bin/node
"use strict";

import Twit from "twit";

var T = new Twit({
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token: process.env.TW_TOKEN,
  access_token_secret: process.env.TW_SECRET,
  timeout_ms: 30 * 1000,
});

export const fetchFollowers = () =>
  T.get("followers/ids", { stringify_ids: true })
    .then((r) => r.data.ids)
    .catch((err) => console.log(err));

export const lookup = (ids) =>
  T.get("users/lookup", { user_id: ids.join(",") }).then((r) => r.data);
