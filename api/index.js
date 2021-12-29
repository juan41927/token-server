require("dotenv").config();

const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const tokenGenerator = require("../src/token_generator");

// Create Express webapp
const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(express.urlencoded({ extended: false }));

app.get("/api", (request, res) => {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  const identity = request.query.identity || "identity";
  const room = request.query.room;

  if (identity === "undefined" || room === "undefined") {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: {},
    });
  }
  const token = tokenGenerator(identity, room);
  res.send(token);
});

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  console.trace(err);
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {},
  });
});

// Create an http server and run it
const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log("Express server running on *:" + port);
});
