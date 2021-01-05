"use strict";

const fetch = require("node-fetch");

const notificationURL = `https://maker.ifttt.com/trigger/new_unfollowers/with/key/${process.env.IFTTT_KEY}`;

function send(msg) {
  fetch(notificationURL, {
    method: "POST",
    body: JSON.stringify({ value1: msg }),
    headers: { "Content-Type": "application/json" },
  })
    .then(() => {
      console.log(`Posted to IFTTT: "${msg}"`);
    })
    .catch((err) => {
      console.log("Error posting to IFTTT:", err);
    });
}

module.exports = { send };
