const express = require("express");
const bodyParser = require("body-parser");

// TODO - have proper config stuff
const VALID_TOKEN="abc123";

let g_config;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/ping", (req, res) => {
  res.status(200).send("PONG");
});

app.post("/:hook", (req, res) => {
  if (!g_config) {
    console.log("No config!");
    res.status(500).end();
  }
  if (!req.params.hook) {
    console.log("No hook.");
    res.status(404).end();
    return;
  }

  let hook = g_config.hooks.find(h => h.name == req.params.hook);

  if (!req.query.token || (req.query.token != hook.token)) {
    res.status(401).end();
    return;
  }

  console.log("Processing hook", hook)
  if (hook.command) {
    console.log("Running", hook.command);
    res.status(200).end();
  } else {
    console.log("Nothing to do, no command.");
    res.status(200).end();
  }
});

function buildApp(config) {
  g_config = config;
  return app;
}

module.exports = buildApp;
