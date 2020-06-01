const fs = require("fs");
const { spawn } = require("child_process");
const express = require("express");
const bodyParser = require("body-parser");

let g_config;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/ping", (req, res) => {
  res.status(200).send("PONG");
});

app.post("/:hook", async (req, res) => {
  if (!g_config) {
    console.log("No config!");
    res.sendStatus(500);
    return;
  }
  if (!req.params.hook) {
    console.log("No hook.");
    res.sendStatus(404);
    return;
  }

  let hook = g_config.hooks.find(h => h.name == req.params.hook);

  if (!req.query.token || (req.query.token != hook.token)) {
    res.status(401).end();
    return;
  }

  if (hook.command) {
    try {
      fs.statSync(hook.command);
      const child = spawn(hook.command);
      res.status(200);
      child.stdout.on('end', () => res.end());
      child.stdout.pipe(res);
    } catch (err) {
      if (err.code === "ENOENT") {
        res.sendStatus(406);
      } else {
        console.error("Error", err);
        res.sendStatus(500);
      }
    }
  } else {
    res.sendStatus(200);
  }
});

function buildApp(config) {
  g_config = config;
  return app;
}

module.exports = buildApp;
