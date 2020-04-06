//w2api - Version 0.0.1
var fs = require('fs');
var request = require('request').defaults({ encoding: null });
global.ALLOW_TYPES = ['application/pdf','image/jpeg','image/png','audio/ogg','image/gif'];
global.default_timeout = 3000;
global.download = require('download-file');

exports.install = function() {
	
	/*
	* API ROUTES - Client Configuration
	* This route exist to you can scan qrCode remotelly from browser
	*/
	ROUTE('/{instance}/qrcode/',				view_qrcode			);

	/*
	* API ROUTES - Services
	* This routes provide you methods to send messages over API 
	* Discover more over documentation at: 
	*/
	ROUTE('/{instance}/sendMessage',			sendMessage,		['post',default_timeout]);
	ROUTE('/{instance}/sendPTT',				sendPTT,			['post',default_timeout]);
	ROUTE('/{instance}/sendFile',				sendFile,			['post',default_timeout]);
	ROUTE('/{instance}/sendLocation',			sendLocation,		['post',default_timeout]);
	ROUTE('/{instance}/sendGiphy', 				sendGiphy,			['post',default_timeout]);
	ROUTE('/{instance}/sendContact',			sendContact,		['post',default_timeout]);
	ROUTE('/{instance}/typing',					typing,				['post',default_timeout]);

	/*
	* API ROUTES - PersonalInformation
	* This routes provide you methods to manipulate personal information of numberConnected
	* Discover more over documentation at: 
	*/
	ROUTE('/{instance}/setMyName/',				setMyName,			['post',default_timeout]);
	ROUTE('/{instance}/setMyStatus/',			setMyStatus,		['post',default_timeout]);

	/*
	* API ROUTES - Master Routes
	* This routes provide you methods to get branch of information over an single request
	* Discover more over documentation at: 
	*/
	ROUTE('/{instance}/dialogs',				dialogs,			[]);
	ROUTE('/{instance}/getChatById',			getChatById,		['post',default_timeout]);

	/*
	* API ROUTES - Instance Routes
	* This routes provide you methods to manipulate instance
	* Discover more over documentation at: 
	*/
	ROUTE('/{instance}/{masterKey}/screenCapture',			screenCapture,		[]);
	ROUTE('/{instance}/{masterKey}/isConnected',			isConnected,		[]);
	ROUTE('/{instance}/{masterKey}/takeOver',				takeOver,			[]);
	ROUTE('/{instance}/{masterKey}/batteryLevel',			batteryLevel,		[]);

};

var BODY_CHECK = function(BODY){
	return new Promise(function(resolve, reject) {
		if (typeof BODY['chatId'] !== 'undefined') {
			resolve({status:true, chatId: BODY['chatId'] });
		} else {
			if (typeof BODY['phone'] !== 'undefined') {
				resolve({status:true, chatId: BODY['phone']+"@c.us" });
			} else {
				resolve({status:false});
			}
		}
	}).catch((err) => {
		console.log("########## ERROR AT VERIFY BODY ################");
		console.log(err);
		console.log("########## ERROR AT VERIFY BODY ################");
	});
};

/*
* Route to send Messages
* tested on version 0.0.1
* performance: operational
*/
function sendMessage(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			if (typeof BODY['body'] !== 'undefined') {
				BODY_CHECK(BODY).then(function(processData){
					if(processData.status){
						WA_CLIENT.CONNECTION.sendText(processData.chatId, BODY['body']);
						self.json({status:true});
					} else {
						self.json({status:false, err: "It is mandatory to inform the parameter 'chatId' or 'phone'"});
					}
				});
			} else {
				self.json({status:false, err: "Paramether body is mandatory"});
			}
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* Route to send Audios as file attached
* tested on version 0.0.1
* performance: operational
*/
function sendPTT(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			if (typeof BODY['audio'] !== 'undefined') {
				BODY_CHECK(BODY).then(function(processData){
					if(processData.status){
						var download_options = {
						    directory:F.path.private()+'audios/' ,
						    filename: U.GUID(10)+"-"+U.GUID(10)+".ogg"
						};
						request.get(BODY['audio'], function (error, response, body) {
						    if (!error && response.statusCode == 200) {
						        data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
								WA_CLIENT.CONNECTION.sendFile(processData.chatId,data,'audio.ogg', (BODY['caption'] ? BODY['caption'] : ""));
						    }
						});
						self.json({status:true});
					} else {
						self.json({status:false, err: "It is mandatory to inform the parameter 'chatId' or 'phone'"});
					}
				});
			} else {
				self.json({status:false, err: "Paramether audio is mandatory"});
			}
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* Route to send Files
* tested on version 0.0.1
* performance: operational
*/
function sendFile(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			if (typeof BODY['body'] !== 'undefined' && typeof BODY['filename'] !== 'undefined') {
				BODY_CHECK(BODY).then(function(processData){
					if(processData.status){
						var download_options = {
						    directory:F.path.private()+'files/' ,
						    filename: BODY['filename']
						};
						request.get(BODY['body'], function (error, response, body) {
						    if (!error && response.statusCode == 200) {
						        data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
						        if(ALLOW_TYPES.includes(response.headers["content-type"].split(';')[0])){
									WA_CLIENT.CONNECTION.sendFile(processData.chatId,data,BODY['filename'], (BODY['caption'] ? BODY['caption'] : ""));
									self.json({status:true});
						        } else {
									self.json({status:false, err: "Type of file not allowed"});
						        }
						    } else {
								self.json({status:false, err: "Internal error to process this file - contact support now"});
						    }
						});
					} else {
						self.json({status:false, err: "It is mandatory to inform the parameter 'chatId' or 'phone'"});
					}
				});
			} else {
				self.json({status:false, err: "Paramether body and filename is both mandatory"});
			}
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* Route to send location
* tested on version 0.0.1
* performance: degradated
*/
function sendLocation(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			if (typeof BODY['lat'] !== 'undefined' && typeof BODY['lng'] !== 'undefined' && typeof BODY['address'] !== 'undefined') {
				BODY_CHECK(BODY).then(function(processData){
					if(processData.status){
						WA_CLIENT.CONNECTION.sendLocation(processData.chatId, BODY['lat'], BODY['lng'], BODY['address']);
						self.json({status:true});
					} else {
						self.json({status:false, err: "It is mandatory to inform the parameter 'chatId' or 'phone'"});
					}
				});
			} else {
				self.json({status:false, err: "Os parâmetros lat, lng e address são obrigatório"});
			}
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* Route to send Giphy
* tested on version 0.0.1
* performance: degradated
*/
function sendGiphy(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			if (typeof BODY['link'] !== 'undefined' && typeof BODY['caption'] !== 'undefined') {
				BODY_CHECK(BODY).then(function(processData){
					if(processData.status){
						WA_CLIENT.CONNECTION.sendGiphy(processData.chatId,BODY['link'],BODY['caption']);
						self.json({status:true});
					} else {
						self.json({status:false, err: "It is mandatory to inform the parameter 'chatId' or 'phone'"});
					}
				});
			} else {
				self.json({status:false, err: "Parameters 'link' and 'caption' are mandatory"});
			}
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* Route to send Contact
* tested on version 0.0.2
* performance: NotTested
*/
function sendContact(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			if (typeof BODY['contact'] !== 'undefined') {
				BODY_CHECK(BODY).then(function(processData){
					if(processData.status){
						WA_CLIENT.CONNECTION.sendContact(processData.chatId,BODY['contact']);
						self.json({status:true});
					} else {
						self.json({status:false, err: "It is mandatory to inform the parameter 'chatId' or 'phone'"});
					}
				});
			} else {
				self.json({status:false, err: "Parameter 'contact' is mandatory"});
			}
		} else {
			self.json({status:false, err: "Your company is not set yet"});
		}
	}
}

/*
* That route allow you to get all dialog list from device
* tested on version 0.0.4
* performance: Operational
*/
function dialogs(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			WA_CLIENT.CONNECTION.getAllChats().then(function(contacts){
				self.json({status:true, dialogs:contacts});
			});
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* That route allow you to get information about an chat just using id of contact
* tested on version 0.0.4
* performance: Operational
*/
function getChatById(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			BODY_CHECK(BODY).then(function(processData){
				if(processData.status){
					WA_CLIENT.CONNECTION.getChatById(processData.chatId).then(function(Chat){
						self.json({status:true, data: Chat});
					});
				} else {
					self.json({status:false, err: "It is mandatory to inform the parameter 'chatId' or 'phone'"});
				}
			});
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* That route allow you to simulate typing into an conversation
* performance: Not Tested
*/
function typing(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			BODY_CHECK(BODY).then(function(processData){
				if(processData.status){
					if(typeof BODY['state'] !== 'undefined'){
						WA_CLIENT.CONNECTION.simulateTyping(processData.chatId,BODY['state']);
						self.json({status:true});
					} else {
						self.json({status:false, err: "Parameter state is not set"});
					}
				} else {
					self.json({status:false, err: "Internal error, please contact support team"});
				}
			});
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* That's amazing route allow you to see whats going on inside your headless - an screencapture is made from you
* can be necessary load twice times that address to receive an image, pay some attention too because all images 
* is saved at /public/screenshot/
* tested on version 0.0.4
* performance: Operational
*/
function screenCapture(instance,masterKey){
	var self = this;
	if(WA_CLIENT){
		if(F.config['masterKey'] == masterKey){
			if(WA_CLIENT.TOKEN == self.query['token']){
				var imageAddress = U.GUID(10)+'.png';
				WA_CLIENT.CONNECTION.page.screenshot({path: F.path.public()+'screenshot/'+imageAddress});
				setTimeout(function(){
					self.view('screenshot', {address: '/screenshot/'+imageAddress+'?time='+Math.floor(Date.now() / 1000)});
				},1000);
			} else {
				self.json({status:false, err: "Wrong token authentication"});
			}
		} else {
			self.json({status:false, err: "You don't have permissions to this action"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* Route to check if your device is connected of not to application
* tested on version 0.0.4
* performance: Operational
*/
function isConnected(instance,masterKey){
	var self = this;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			WA_CLIENT.CONNECTION.isConnected().then(function(response){
				self.json({status:true, instance_status: response});
			}).catch((err) => {
				self.json({status:false, err: 'Internal Error - please contact support now'});
			});
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* Route to takeOver conenction when your number open whatsWeb into another browser
* tested on version 0.0.4
* performance: Operational
*/
function takeOver(instance,masterKey){
	var self = this;
	if(WA_CLIENT){
		if(F.config['masterKey'] == masterKey){
			if(WA_CLIENT.TOKEN == self.query['token']){
				WA_CLIENT.CONNECTION.forceRefocus();
				self.json({status:true});
			} else {
				self.json({status:false, err: "Wrong token authentication"});
			}
		} else {
			self.json({status:false, err: "You don't have permissions to this action"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* Route to change your personal name of number Connected
* tested on version 0.0.4
* performance: Degradated
*/
function setMyName(){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(BODY['newName']){
			if(WA_CLIENT.TOKEN == self.query['token']){
				console.log("Setting new name: ",BODY['newName']);
				WA_CLIENT.CONNECTION.setMyName(BODY['newName']);
				self.json({status:true});
			} else {
				self.json({status:false, err: "Wrong token authentication"});
			}
		} else {
			self.json({status:false, err: "newName paramether is mandatory!"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* Route to change your personal status of number Connected
* tested on version 0.0.4
* performance: Operational
*/
function setMyStatus(){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(BODY['newStatus']){
			if(WA_CLIENT.TOKEN == self.query['token']){
				console.log("Setting new status: ",BODY['newStatus']);
				WA_CLIENT.CONNECTION.setMyStatus(BODY['newStatus']);
				self.json({status:true});
			} else {
				self.json({status:false, err: "Wrong token authentication"});
			}
		} else {
			self.json({status:false, err: "newStatus paramether is mandatory!"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* This route allow you to check battery of device running whatsApp
* tested on version 0.0.4
* performance: Operational
*/
function batteryLevel(instance,masterKey){
	var self = this;
	if(WA_CLIENT){
		if(F.config['masterKey'] == masterKey){
			if(WA_CLIENT.TOKEN == self.query['token']){
				WA_CLIENT.CONNECTION.getBatteryLevel().then(function(response){
					console.log(response);
					self.json({status:true, batteryLevel: response});
				});
			} else {
				self.json({status:false, err: "Wrong token authentication"});
			}
		} else {
			self.json({status:false, err: "You don't have permissions to this action"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

/*
* Route check your QRCode over browser
* tested on version 0.0.4
* performance: Operational
*/
function view_qrcode(CLIENT_ID){
	var self = this;
	if(WA_CLIENT){
		self.view('qrcode', {qrcode: WA_CLIENT.QR_CODE});
	} else {
		self.throw404('QR CODE NOT FOUND IN THIS SERVER');
	}
}