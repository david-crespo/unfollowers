# Unfollowers

A script that downloads all your Twitter followers and notifies you about who unfollowed.

### Limitations

* Only looks at your first 5000 followers
* If more than 3 people unfollowed you, you will only see the first 3

Neither of these are too hard to fix, I just didn't need to do it for my own use case.

## How to host with Heroku and IFTTT

### Twitter

1. Go to https://apps.twitter.com and create a new app with read only permissions
1. On the **Keys and Access Tokens** page, note the consumer key and secret and the access token and token secret. You will need to set them as config vars in Heroku (see below).

### IFTTT

1. Create an account, obviously
1. Connect the **Webhooks** service and take note of the URL that looks like `https://maker.ifttt.com/use/<IFTTT_KEY>`. You will need this key (see below).
1. Create a Webhooks applet with an event `new_unfollowers` as its trigger and a notification as its effect. Set `{{Value1}}` as the contents of the notification.
1. Install the IFTTT app on your phone and log in. Make sure you give it permission to send you notifications.

### Heroku

1. Create an app on Heroku
1. Install plugin **Heroku Scheduler**
1. Install plugin **Heroku Redis** (this will automatically set the `REDIS_URL` config var)
1. Clone this repo and add your Heroku app as a remote with `heroku git:remote -a <heroku_app_name>`
1. Deploy to Heroku with `git push heroku master`
1. Click Heroku Scheduler on the overview page and add a new job that runs `node src/index.js` every 10 minutes (or hourly, or daily)

### Heroku config variables

Manually set the following config variables in Heroku, under **Settings**:

| Key  | Description |
| ------------- | ------------- |
| `IFTTT_KEY` | The key from the IFTTT Webhooks URL |
| `TW_CONSUMER_KEY` | Consumer Key (API Key) |
| `TW_CONSUMER_SECRET` | Consumer Secret (API Secret) |
| `TW_TOKEN` | Access Token |
| `TW_SECRET` | Access Token Secret  |

`REDIS_URL` is automatically set by the Redis plugin.

## Running it locally first to test that it works

1. Go through almost all the steps above (you only need up to step 3 in Heroku — no need to deploy)
1. Install Node if you don't have it (I've only tested this with Node 8.4.0)
1. Run `npm i` in the repo directory
1. Set all of the above environment variables locally, including `REDIS_URL`. The easiest way to do that is to make a file called `.env` that looks like this

  ```
  export IFTTT_KEY=xxxxxxxxxxxx
  export TW_CONSUMER_KEY=xxxxxxxxxxxx
  ...
  ```

  and run it with `source .env`.
1. Run `node src/index.js`. Output should look like this:

  ```
  $ node src/index.js
  Found 300 followers (previously 0)
  Found 0 unfollowers
  Saving 30 followers to redis
  ```
  That proves the connections to Redis and Twitter are working.
1. Run `node src/index.js`. Output should look like this

  ```
  $ node src/test-notification.js
  Posted to IFTTT: "This is a test notification!"
  ```

  and you should get a notification on your phone.
