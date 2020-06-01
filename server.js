require("dotenv").config();

const fs = require("fs");
const https = require("https");
const http = require("http");

const app = require("./src/app")();

const PORT = process.env.PORT || 8000;

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
  
async function run() {
  let server = await buildServer(app);
  server.listen(PORT, async function() {
    let host = server.address().address;
    let port = server.address().port;

    console.log("App listening at https://" + host + ":" + port);
    console.log("App startup " + new Date());
  })
}

run();
