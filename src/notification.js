#! /app/.heroku/node/bin/node
'use strict';

const request = require('request');

const notificationURL = `https://maker.ifttt.com/trigger/new_unfollowers/with/key/${
  process.env.IFTTT_KEY
}`;

function send(msg) {
  request(
    {
      url: notificationURL,
      method: 'POST',
      json: true,
      body: {
        value1: msg
      }
    },
    function(err, res, body) {
      if (err) {
        console.log('Error posting to IFTTT:', err);
      } else {
        console.log(`Posted to IFTTT: "${msg}"`);
      }
    }
  );
}

module.exports = { send };
