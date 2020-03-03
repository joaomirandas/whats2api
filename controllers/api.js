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
	ROUTE('/{instance}/sendLink',				sendLink,			['post',default_timeout]);
	ROUTE('/{instance}/typing',					typing,				['post',default_timeout]);

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

function sendContact(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			if (typeof BODY['contact'] !== 'undefined' ) {
				BODY_CHECK(BODY).then(function(processData){
					if(processData.status){
						WA_CLIENT.CONNECTION.sendContact(processData.chatId, BODY['contact']);
						self.json({status:true});
					} else {
						self.json({status:false, err: "It is mandatory to inform the parameter 'chatId' or 'phone'"});
					}
				});
			} else {
				self.json({status:false, err: "It is mandatory to inform the parameter 'contact'"});
			}
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

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

function sendLink(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			if (typeof BODY['thumb'] !== 'undefined' && typeof BODY['url'] !== 'undefined' && typeof BODY['title'] !== 'undefined') {
				BODY_CHECK(BODY).then(function(processData){
					if(processData.status){
						WA_CLIENT.CONNECTION.sendMessageWithThumb(BODY['thumb'].replace('data:'+base64MimeType(BODY['thumb'])+';base64,', ''), BODY['url'], BODY['title'], (BODY['description'] ? BODY['description'] : ''),processData.chatId);
						
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

function dialogs(instance){
	var self = this;
	var BODY = self.body;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			WA_CLIENT.CONNECTION.getAllChats().then(function(contacts){
				console.log(contacts);
				self.json({status:true, dialogs:contacts});
			});
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

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

function screenCapture(instance,masterKey){
	var self = this;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			WA_CLIENT.CONNECTION.page.screenshot({path: F.path.public()+'screenshot/'+U.GUID(10)+'.png'});
			self.view('screenshot', {address: 'screenshot/'+U.GUID(10)+'.png'});
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

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

function takeOver(instance,masterKey){
	var self = this;
	if(WA_CLIENT){
		if(WA_CLIENT.TOKEN == self.query['token']){
			WA_CLIENT.CONNECTION.forceRefocus();
			self.json({status:true});
		} else {
			self.json({status:false, err: "Wrong token authentication"});
		}
	} else {
		self.json({status:false, err: "Your company is not set yet"});
	}
}

function view_qrcode(CLIENT_ID){
	var self = this;
	if(WA_CLIENT){
		self.view('qrcode', {qrcode: WA_CLIENT.QR_CODE});
	} else {
		self.throw404('QR CODE NOT FOUND IN THIS SERVER');
	}
}