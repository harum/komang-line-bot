'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const replayer = require('./src/replayer');
const logger = require('heroku-logger');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();
const jsonParser = bodyParser.json()

// this webhook withou auth
// need to investigae why auth in line middleware not passed
app.post('/webhook', jsonParser, (req, res) => {
  logger.info('Events', req.body.events);
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch();
});

// app.post('/webhook', line.middleware(config), (req, res) => {
//   Promise
//     .all(req.body.events.map(handleEvent))
//     .then((result) => res.json(result));
// });

// event handler
function handleEvent(event) {
  logger.info('Event', event);
  if (event.type !== 'join' && (event.type !== 'message' || event.message.type !== 'text')) {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  let replayText = {};
  if (event.type === 'join') {
    replayText = { type: 'join' };
  } else {
    replayText = { type: 'text', text: replayer.replay(event.message.text) };
  }

  // use reply API
  return client.replyMessage(event.replyToken, replayText);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
