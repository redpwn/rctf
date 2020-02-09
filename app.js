global.__rootdir = __dirname;

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

const app = express();
app.set("trust proxy", "127.0.0.1");

app.use(bodyParser.urlencoded({ extended: false }));

const staticPath = __dirname + "/static";
app.use("/static", express.static(staticPath));

module.exports = app;
