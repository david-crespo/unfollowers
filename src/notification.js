#! /app/.heroku/node/bin/node
"use strict";

import request from "request";

const notificationURL = `https://maker.ifttt.com/trigger/new_unfollowers/with/key/${process.env.IFTTT_KEY}`;

export function send(msg) {
  request(
    {
      url: notificationURL,
      method: "POST",
      json: true,
      body: { value1: msg },
    },
    function (err) {
      if (err) {
        console.log("Error posting to IFTTT:", err);
        return;
      }

      console.log(`Posted to IFTTT: "${msg}"`);
    },
  );
}
