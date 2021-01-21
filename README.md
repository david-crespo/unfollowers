# Unfollow Notifier

A script that notifies you of Twitter unfollowers. It runs every 10 minutes on AWS Lambda, comparing the current follower list with a copy of the previous run's list persisted on S3. If you have lost followers, it will send a push notification through IFTTT. Lambda and S3 setup is made simple by the [serverless](https://www.serverless.com/) framework.

## Setup

Start by cloning this repo.

### Twitter

You need an API key in order to pull your followers list from Twitter.

1. Go to https://apps.twitter.com and create a new app with read only permissions
1. On the **Keys and Access Tokens** page, note the consumer key and secret and the access token and token secret. You will need to set them as environment variables when you deploy.

### IFTTT

1. Create an account
1. Connect the **Webhooks** service and take note of the URL that looks like `https://maker.ifttt.com/use/<IFTTT_KEY>`. You will need this key (see below).
1. Create a Webhooks applet with an event `new_unfollowers` as its trigger and a notification as its effect. Set `{{Value1}}` as the contents of the notification.
1. Install the IFTTT app on your phone and log in. Make sure you give it permission to send you notifications.

### Environment variables

This is necessary for the deploy. `serverless.yml` picks up these environment variables and makes them available to the Lambda function when it runs.

Create a file `.env` in the project directory (it is already gitignored) with the following contents, using the keys from the above steps.

```bash
export IFTTT_KEY=xxxxxxxxxxxx
export TW_CONSUMER_KEY=xxxxxxxxxxxx
export TW_CONSUMER_SECRET=xxxxxxxxxxxx
export TW_TOKEN=xxxxxxxxxxxx
export TW_SECRET=xxxxxxxxxxxx
export S3_BUCKET=<any unique name, e.g., unfollowers-asdfasdf>
```

Set them in your actual env by running

```bash
source .env
```

### Testing the setup

First make sure you have [Node 12.x](https://nodejs.org/en/) and run `npm i` to install dependencies. Then run the following scripts to confirm that the env vars are working. If you get errors instead of the sample output given below, it means your env vars are not set up correctly.

```
$ node src/test-notification.js
Posted to IFTTT: "This is a test notification!"
```

If you have the IFTTT app set up, you should receive a push notification (eventually).

```
$ node src/test-twitter.js
Current followers: 1234
First three followers:
  Display Name 1 (@username1)
  Display Name 2 (@username2)
  Display Name 3 (@username3)
```

### Serverless and AWS

Make an account on [AWS](https://aws.amazon.com/). Install serverless with `npm i -g serverless`. Then run `serverless deploy`, and it will lead you through a configuration wizard.

Serverless is basically a wrapper around AWS CloudFormation, which in our case is used to set up a Lambda function and S3 bucket, so it relies on AWS creds with permission to do those things. The first time you run `serverless deploy`, it will help you configure your AWS credentials. It will even take you to the AWS console to create a pre-filled user called `serverless`. The weird bit here is that you have to choose which permissions to give it, and the necessary permissions depend on your app. I went with these policies:

- `AWSLambdaFullAccess`
- `AWSCloudFormationFullAccess`
- `IAMFullAccess`

Serverless generates CloudFormation JSON files in the `.serverless` directory that list all the actions it takes during deploy, so in theory you could look there if you really wanted to pick the most minimal possible set of permissions. If you don't already know why you would want to do that, most likely you don't need to do that.

## Deploy

Remember to set the env vars with `source .env`, and then run

```
serverless deploy
```

If you want to take the lambda function down, run

```
serverless remove
```

## Logs

You can then get the server logs from Lambda with

```
serverless logs -f checkUnfollowers
```

Add `--startTime 3d` to get more than the most recent run.

Note that this command will error out until the function runs for the first time, which takes 10 minutes since it's on a 10 minute cron schedule. If there are errors connecting to Twitter, S3, or IFTTT, they will show up in the logs. When it's working it should look like this:

```
Current followers: <curr>
Previous followers: <prev>
Saving <curr> follower IDs to S3
Found <prev - curr> unfollowers
```

The first time it runs, there will be `Error reading from S3: AccessDenied` error because the file is not there on S3. This is fine, because it will create the file on the first run. Subsequent runs will look like the above.
