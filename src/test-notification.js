const notification = require("./notification.js");

async function f() {
  await notification.send("This is a test notification!");
}

f();
