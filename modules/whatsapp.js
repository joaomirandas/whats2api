//w2api - Version 0.0.1
const sulla = require('sulla-hotfix');
var fs = require('fs');
var async = require("async");
var request = require('request');
var moment = require('moment');
const mime = require('mime-types');
global.uaOverride = 'WhatsApp/2.16.352 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15';
global.WA_CLIENT = {};

/*
* WhatsApp API SUPER CLASS
* Personal regards to:
* Mohhamed Shah (Sulla Hotfix) - 
* Peter Sírka (TotalJS) - 
* This library was built using SUllaHotfix and pieces of 
*/
function WHATS_API(USER_ID) {
  console.log("\n====================================================");
  console.log("@@Creating WhatsApp connection for: "+USER_ID);
  console.log("====================================================\n");
  this.QR_CODE = "";
  this.WEBHOOK = "";
  this.TOKEN = "";
  this.INSTANCE = USER_ID;
  this.CONNECTION = {};
};

/*
* Sanitizing the type of ack response i want on webhook POST request
* you can edit this method but pay attention to documentation.
* ACK EVENTS:
* 1 - send 
* 2 - delivered
* 3 - viewed
* 4 - listened
*/
var SANITIZE_ACK = function(data){
  return JSON.stringify({
      ack: [{
        id: data.id._serialized,
        chatId: data.id.remote,
        status: (data.ack == 1 ? 'sent' : (data.ack == 2 ? 'delivered' : 'viewed'))
      }],
      instanceId: that.INSTANCE
  });
};

/*
* Sanitizing the type of message response i want on webhook POST request
* you can edit this method but pay attention to documentation.
*/
var SANITIZE_MSG = function(data) {
  return JSON.stringify({
    messages: [{ 
      id: data.id,
      body: data.body,
      fromMe: false,
      self: 0,
      isForwarded: data.isForwarded,
      author: data.from,
      time: data.t,
      chatId: data.chat.id,
      type: data.type,
      senderName: data.sender.verifiedName,
      caption: (data.caption ? data.caption : null),
      quotedMsgBody: (data.quotedMsgObj ? data.quotedMsgObj : null),
      chatName: data.sender.formattedName 
    }],
    instanceId: that.INSTANCE
  });
};

/*
* Creating an prototype of messages to send information and control flow over webhook
* you can edit this method but pay attention to documentation.
*/
WHATS_API.prototype.PROCESS_MESSAGE = function(data){
  var that = this;
  var SANITIZED = SANITIZE_MSG(data);
  request({
    method: 'POST',
    url:  that.WEBHOOK,
    headers: { 'Content-Type': 'application/json' },
    body: SANITIZED
  }, function(err, response, body){
    if(err){
      ERROR_CATCHER(err);
    } else {
      if(response.statusCode != 200){
        ERROR_CATCHER("Status Code error: "+response.statusCode,response);
      } else {
        console.log(SANITIZED);
      }
    }
  });
};

/*
* Creating an prototype of ack events to send information and control flow over webhook
* you can edit this method but pay attention to documentation.
*/
WHATS_API.prototype.PROCESS_ACK = function(data){
  var that = this;
  var SANITIZED = SANITIZE_ACK(data);
  request({
    method: 'POST',
    url:  that.WEBHOOK,
    headers: { 'Content-Type': 'application/json' },
    body: SANITIZED
  }, function(err, response, body){
     if(err){
      ERROR_CATCHER(err);
    } else {
      if(response.statusCode != 200){
        ERROR_CATCHER("Status Code WRONG: "+response.statusCode,response);
      } else {
        console.log(SANITIZED);
      }
    }
  });
};

/*
* to-do - Creating webhook events to inform when something goes wrong with API
* if you have any knowleadge about it - help me to improve
*/
WHATS_API.prototype.PROCESS_STATE = function(data){
  console.lgo("STATE CHANGED: ",data);
};

/*
* Prototype configuration for setup events incoming from sulla module
* keep your hands away from this
*/
WHATS_API.prototype.SETUP = function(CLIENT,WEBHOOK_INPUT,TOKEN_INPUT) {
  var that = this;
  that.WEBHOOK = WEBHOOK_INPUT;
  that.TOKEN = TOKEN_INPUT;
  that.CONNECTION = CLIENT;
  CLIENT.onMessage(message => {
    //CRECKING IF MESSAGE HAVE ANY MEDIA TYPE EMBED
     if (message.mimetype) {
      //SAVING MEDIA RECEIVED AND EXPOSE ADDRESS TO WEB
      const mediaData = sulla.decryptMedia(message,uaOverride).then(function(DECRYPTED_DATA){
        var filename = `${message.t}.${mime.extension(message.mimetype)}`;
        var imageBuffer = Buffer.from(DECRYPTED_DATA, 'base64');
        that.PROCESS_MESSAGE(message);
      });
    } else {
      that.PROCESS_MESSAGE(message);
    }
  });
  CLIENT.onAck(ack => {
    that.PROCESS_ACK(ack);
  });
  CLIENT.onStateChanged(state => {
    that.PROCESS_STATE(state);
  });
};

WHATS_API.prototype.SET_QRCODE = function(code){
  var that = this;
  that.QR_CODE = code;
};

module.exports = WHATS_API;

ON('ready', function(){
  console.log("\n##############################################");
  console.log("#######      STARTING SERVICE              #####");
  console.log("##############################################\n");
  console.log("@ Servidor Identificado: ",F.config['instance']);

  /*
  * Creating Connection for WhatsApp and expose conection to WA_CLIENT global var
  * Pay attention to instance id configured on /config file
  */
  WA_CLIENT = new WHATS_API(F.config['instance']);

  /*
  * Declare event getter for when qrcode is available from sulla-api
  */
  sulla.ev.on('qr.**', function (qrcode,sessionId) {
    //SETTING QRCODE AVAILABLE ON address/qrCode
    WA_CLIENT.SET_QRCODE(qrcode);

    // var imageBuffer = Buffer.from(qrcode, 'base64');
    // fs.writeFileSync(F.path.public('/QR_CODES/qr_code_'+(sessionId ? sessionId.replace('.','') : '')+'.png') , imageBuffer);
  });

  /*
  * Finally creating connection and start headless webbrowser
  * Attention to headless param
  */
  sulla.create(F.config['instance'],{
    headless: true,
    autoRefresh:false, 
    qrRefreshS:30,
    killTimer: 60
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // executablePath: '/var/www/app/node_modules/puppeteer/.local-chromium/linux-706915'
  }).then(function(client){
    //EXECUTING MODULE SETUP
    WA_CLIENT.SETUP(client, F.config['webhook'], F.config['token']);
  });

});
