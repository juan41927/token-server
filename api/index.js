require("dotenv").config();

const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const tokenGenerator = require("../src/token_generator");

const FCM = require('fcm-node');
const serverKey = process.env.PUSH_SERVICE;
const fcm = new FCM(serverKey);

// Create Express webapp
const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(express.urlencoded({ extended: false }));

app.get("/api", (request, res) => {
  res.setHeader("Content-Type", "text/html");
  const identity = request.query.identity;
  const room = request.query.room;

  console.log(identity);

  if (identity === undefined || room === undefined) {
    res.status(err.status || 500);
    res.send({
      message: "Debe definir un usuario y un chat room",
      error: {},
    });
  }
  const token = tokenGenerator(identity, room);
  res.send(token);
});

/** Recibe Push notification from mobile app */
app.post('/send-push', (req, res) => {
  const message = {
    registration_ids: [...req.body.userFcmToken] ,  // array required
    notification: {
      title:req.body.notificationTitle ,
      body: req.body.notificationBody,
      sound:  "default",
      icon: "ic_launcher",
      badge:  req.body.notificationBadge ? req.body.notificationBadge : "1",
      click_action: 'FCM_PLUGIN_ACTIVITY',
    },
    priority: req.body.notificationPriority ? req.body.notificationPriority : 'high',
    data: {
      action:req.body.actionType, // Action Type
      payload:req.body.payload // payload
    }
  }
     
  fcm.send(message, (err, response) => {
    if (err) {
      console.log("Something has gone wrong!", JSON.stringify(err));
      res.send(err);
    } else {
      console.log("Successfully sent with response: ", response);
      res.send(response)
    }
  });

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
