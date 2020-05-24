# WHATS2API - WhatsApp REST API 

<a href="https://liveapps.me/lite/?utm_source=github&utm_medium=badge&utm_campaign=lite"><img width="400" src="https://liveapps.me/pro_badge.png" /></a></br>
[![npm version](https://img.shields.io/npm/v/w2api-master.svg?color=green)](https://www.npmjs.com/package/w2api-master)
<a href="https://discord.gg/UCc9PC"><img src="https://img.shields.io/discord/696393193591144532?color=blueviolet&label=discord&style=flat" /></a>

Welcome to best REST API for WhatsApp. 
This library provide you an complete solution for WhatsApp REST API without any necessities of code or change anything, obviously, if you want, you can contribute but give this information for us over PR. - Important to know, it's not an official solution - if you need something professional please don't use this package.

Special thanks to developers of amazing packages used here, Mohammed Shah [(smashah)](https://github.com/smashah) and Total.js [(totaljs)](https://github.com/totaljs)

## SETUP

This package was thought to be used as service for each connection, so you need to understand the structure of files and folders before start - please read with attention.

Each connection with WhatsApp will need an dedicated running of this, you can run a lot of connections on the same server using PM2 or forever. For better approach too we will provide you an Docker solution.

Each client is undertood as INSTANCE, we gonna set an instance NUMBER for him, to identify after if necessary. If you are running this probably you need to receive messages, the struture of receive will be over WEBHOOK post events, so you need to configure your preffered address too. (TIP: use some service as https://requestcatcher.com/ to test ). Another important thing to set is some TOKEN, this is used for protect your inbound endpoint. For a high level of changes you will need to set an MASTERKEY too, that can be used to do profound changes on server like restarts and force stops.

### Configuring the enviroment
To start - download the package, open /config file and set variables below - please respect type of variables or your code will not run properly

```plain
//WhatsApp Configurations		
instance            : 83430
webhook             : http://localhost:3000
token               : j19ksi1mim1lksm12213
masterKey           : w2apiisthebestlibrary
```

### Start the project

```bash
> npm install && node debug.js
```

As soon you start the project navigate to address http://localhost/{{instanceNumber}}/qrCode and wait for qrCode loads, this page also will auto refresh your qrCode each 30s, so if you does not have success on first attempt just wait and your qrCode will updeta himself. FYI this is run over WebSockets.

## MultiInstances
If you are looking how to run this on multi-instances please let me introduce another way, it's better then old fashion of PM2 and multiple clients on same server(if you don't know what is pm2, dont worry it's not important). The best you can do is run each instance separated, when you realize all that primary updates will be designed thinking on this. That way you avoid troubles on production enviroment effect multiple instances. To do this we gonna use Docker - Advise you to study a little bit docker for run this propperly. (an Docker-compose is alredy prepared for use)

Docker image is available on [DockerHub](https://hub.docker.com/r/joaomirandas/whats2api): https://hub.docker.com/r/joaomirandas/whats2api

You can built your own image with modifications, clone this repo to your preffered local, and run:
```bash
> docker build -t joaomirandas/whats2api .
```
This above command will create an container image of whats2API and prepare for run, when you feel good, just run:
```bash
> docker run --name instance1 -p 8001:8000 joaomirandas/whats2api
```

### Documentation
Full documentation library can be found over Postman Collection, best way to share regardless of the language you prefer to use.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/7437195/Szf82Twx?version=latest) 0.0.8

## Using Library
All the examples below are provided in CURL to allow as many users as possible to enjoy the solutions created, however if you use any specific language feel free to download the Postman collection here and get the code in its best language for you.

At any request you can use "chatId" or "phone" paramether but at the least one of them is necessary to works.

### Sending Messages
```curl
curl --location --request POST 'localhost:8000/83430/sendMessage?token=j19ksi1mim1lksm12213' \
--header 'Content-Type: application/json' \
--data-raw '{
	"chatId":"PHONE_NUMBER@c.us",
	"body": "W2API - Best REST API for WhatsApp"
}'
```

### Sending Audios
This will be sent as attached file, it's not like an audio recorded on mobile device. 
Attention, at this example we use PHONE body paramether, so it's possible send requests using 
```curl
curl --location --request POST 'localhost:8000/83430/sendPTT?token=j19ksi1mim1lksm12213' \
--header 'Content-Type: application/json' \
--data-raw '{
	"phone":"PHONE_NUMBER",
	"audio": "https://upload.wikimedia.org/wikipedia/en/6/68/Crescendo_example.ogg"
}'
```

Request response:
```json
{
    "status": true
}
```

### Sending Files (Image, PDF, TXT, etc..)
This will be sent as attached file, it's important pay attention on maxfilesize allowed.
```curl
curl --location --request POST 'localhost:8000/83430/sendFile?token=j19ksi1mim1lksm12213' \
--header 'Content-Type: application/json' \
--data-raw '{
	"phone":"PHONE_NUMBER",
	"body": "https://upload.wikimedia.org/wikipedia/ru/3/33/NatureCover2001.jpg",
	"filename": "NatureCover2001.jpg",
	"caption": "W2API - Best REST API for WhatsApp"
}'
```

### Sending Location
This will send a location provided to user.
*Performance Operational on version 0.0.8*
```curl
curl --location --request POST 'localhost:8000/83430/sendLocation?token=j19ksi1mim1lksm12213' \
--header 'Content-Type: application/json' \
--data-raw '{
	"chatId":"PHONE_NUMBER@c.us",
	"lat": "51.5074",
	"lng": "0.1278",
	"address": "LONDON!"
}'
```

### Sending Links with preview
This will send a link with thumb preview
*Performance operational on version 0.0.8*
```curl
curl --location --request POST 'localhost:8000/83430/sendLinkPreview?token=j19ksi1mim1lksm12213' \
--header 'Content-Type: application/json' \
--header 'Content-Type: text/plain' \
--data-raw '{
	"chatId":"PHONE-NUMBER@c.us",
	"link": "https://github.com/joaomirandasa/whats2api/",
	"text": "W2API - Best REST API for WhatsApp"
}'
```

### Send Contact
This route allow you to send a lot of information within an VCard.
*Performance Operational on version 0.0.8*
```curl
curl --location --request POST 'localhost:8000/83430/sendContact?token=j19ksi1mim1lksm12213' \
--header 'Content-Type: application/json' \
--header 'Content-Type: text/plain' \
--data-raw '{
	"chatId":"PHONENUMBER@c.us",
	"firstName": "Joao Vitor",
	"middleName": "Miranda",
	"lastName": "Santos",
	"organization": "W2API",
	"photo": "https://avatars3.githubusercontent.com/u/29043431?s=460",
	"workPhone":"+5511995126279",
	"title": "Best API Builder",
	"url": "www.w2api.io",
	"note": "W2API - Best REST API for WhatsApp"
}'
```

### Sending Giphy
This will send an Giphy to user based on his web address.
*Performance Operational on version 0.0.8*
```curl
curl --location --request POST 'localhost:8000/83430/sendGiphy?token=j19ksi1mim1lksm12213' \
--header 'Content-Type: application/json' \
--data-raw '{
	"chatId":"PHONE_NUMBER@c.us",
	"link": "https://media.giphy.com/media/WirhZMBF1AZVK/giphy.gif",
	"caption": "W2API - Best REST API for WhatsApp"
}'
```

### Change your Status
This route allow you to change status information of number connected.
*Performance Operational on version 0.0.8*
```curl
curl --location --request POST 'localhost:8000/83430/setMyStatus?token=j19ksi1mim1lksm12213' \
--header 'Content-Type: application/json' \
--data-raw '{
	"newStatus": "Work & Trust"
}'
```

### Get Battery Level
This route allow you to check battery level of physical device running WhatsApp.
*Performance Operational on version 0.0.8*
```curl
curl --location --request GET 'localhost:8000/83430/w2apiisthebestlibrary/batteryLevel?token=j19ksi1mim1lksm12213'
```

### Read Instance
This route allow you get a lot of informations about instance running and number connected to them.
*Performance Operational on version 0.0.8*
```curl
curl --location --request GET 'localhost:8000/w2apiisthebestlibrary/readInstance'
```

### Restart Instance
This route allow you restart your instance without aceess them over CLI or SSH, this really usefull with Docker.
*Performance Operational on version 0.0.8*
```curl
curl --location --request GET 'localhost:8000/w2apiisthebestlibrary/reloadServer'
```

### Change Webhook
This route allow you to change webhook address on production without restart your server or instance, it's an not permanent change, so if you change this in production and restart, on your next session webhook will continue to be the old one. Tho keep this change permanent you need to change config file on root folder of library.
*Performance Operational on version 0.0.8*
```curl
curl --location --request POST 'localhost:8000/w2apiisthebestlibrary/setWebhook' \
--header 'Content-Type: application/json' \
--data-raw '{
    "webhook": "https://example2.requestcatcher.com"
}'
```

## Receiving files
Since version 0.0.8 it's implemented a new method to receive files, if some message is received as a file, PDF, Image or Audio your webhook will be fired containing an base64 encoded file in that format.
```curl
data:[<media type>][;charset=<character set>][;base64],<data>
```
But to became more aasy for who doenst know how to handle files in base64 format this library will save received files into his own cdn, so when messages contain a file, body of mesage will have an filelink address, and you can just access and get your file from there. These files as saved on /public/cdn/ and you can manage there if you preffer. 

For users running into docker containers it's important realize of storage files as deletes every time you rebuild the container, for persist these files you need to create Volumes.

## Security

To avoid issues with use of this library, it's not allowed start conversations, you only can answer who already talked to you. I can't garantee your number will not be blocked from WhatsApp - You need to be aware of the use you will be making of this tool, be aware you are only responsible for each and every use of this library.

Remember, be blocked from WhatsApp can be unreversible.

## Contributing

I'm looking forward to seeing what you can build out of it, so if you create something using this library, please let me know. If you develop something interesting we will be waiting for your PULL REQUEST.

## License

[MIT](https://choosealicense.com/licenses/mit/)


## Legal

This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by WhatsApp or any of its affiliates or subsidiaries. This is an independent and unofficial software. Use at your own risk.

## Cryptography Notice

This distribution includes cryptographic software. The country in which you currently reside may have restrictions on the import, possession, use, and/or re-export to another country, of encryption software. BEFORE using any encryption software, please check your country's laws, regulations and policies concerning the import, possession, or use, and re-export of encryption software, to see if this is permitted. See [http://www.wassenaar.org/](http://www.wassenaar.org/) for more information.

The U.S. Government Department of Commerce, Bureau of Industry and Security (BIS), has classified this software as Export Commodity Control Number (ECCN) 5D002.C.1, which includes information security software using or performing cryptographic functions with asymmetric algorithms. The form and manner of this distribution makes it eligible for export under the License Exception ENC Technology Software Unrestricted (TSU) exception (see the BIS Export Administration Regulations, Section 740.13) for both object code and source code.

