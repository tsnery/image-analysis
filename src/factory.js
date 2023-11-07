const AWS = require("aws-sdk");
const Handler = require("./handler");

const rekognition = new AWS.Rekognition();
const translate = new AWS.Translate();

const handler = new Handler({
  rekognitionSvc: rekognition,
  translatorSvc: translate,
});

module.exports = handler.main.bind(handler);
