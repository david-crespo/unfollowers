const twitter = require("./twitter.js");

async function testTwitter() {
  const followers = await twitter.fetchFollowers();

  const data = await twitter.lookup(followers.slice(0, 3));
  console.log("First three followers:");
  console.log(data.map((u) => `  ${u.name} (@${u.screen_name})`).join("\n"));
}

testTwitter();
