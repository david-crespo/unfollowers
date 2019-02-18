#! /app/.heroku/node/bin/node
"use strict";

const Twit = require('twit');

var T = new Twit({
  consumer_key: process.env.TW_CONSUMER_KEY,
  consumer_secret: process.env.TW_CONSUMER_SECRET,
  access_token: process.env.TW_TOKEN,
  access_token_secret: process.env.TW_SECRET,
  timeout_ms: 30*1000
})

module.exports = {
  fetchFollowers: () => (
    T.get('followers/ids', { stringify_ids: true })
     .then(r => r.data.ids)
     .catch(err => console.log(err))
  ),
  lookup: ids => T.get('users/lookup', { user_id: ids.join(',') }).then(r => r.data)
};
