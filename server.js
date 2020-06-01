require("dotenv").config();

const fs = require("fs");
const https = require("https");
const http = require("http");

let config = loadConfig();
const app = require("./src/app")(config);

async function buildServer(app) {
  let server;
  let serverOptions = {};
  if (process.env.NODE_ENV === "production") {
    console.log("Creating HTTP server");
    server = http.createServer(serverOptions, app)
  } else {
    console.log("Creating HTTPS server");
    serverOptions["key"] = fs.readFileSync("certs/localhost-key.pem");
    serverOptions["cert"] = fs.readFileSync("certs/localhost.pem");
    server = https.createServer(serverOptions, app)
  }
  return server;
}

function loadConfig() {
  let config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  return config;
}
  
async function run() {
  let server = await buildServer(app);
  server.listen(config.app.port, async function() {
    let host = server.address().address;
    let port = server.address().port;

    console.log("App listening at https://" + host + ":" + port);
    console.log("App startup " + new Date());
  })
}

run();
