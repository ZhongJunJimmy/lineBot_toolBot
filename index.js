var linebot = require('linebot');
var moment = require('moment');
const fs = require('fs');

let rawdata = fs.readFileSync('./config.json');
let config = JSON.parse(rawdata);

// check running mode
let debugMode = 0;
if (process.argv.length > 2){
	if(process.argv.indexOf("debug") !== -1)
		debugMode = 1;
}

// Line Channel info
var bot = linebot({
  channelId: config.channelId,
  channelSecret: config.channelSecret,
  channelAccessToken: config.channelAccessToken
});
//print linebot info in debug mode
logMessage("DEBUG", `Linebot info: ${JSON.stringify(bot)}`);



// message event trigger
bot.on('message', function (event) {
	try{
		event.source.profile().then(function (profile) {
			var userName = profile.displayName;
			logMessage("DEBUG", `event.message: ${JSON.stringify(event.message)}`);
			logMessage("DEBUG", `event.source.profile: ${JSON.stringify(profile)}`);
			switch(event.message.type){
				case 'text':
					//receive text process
					logMessage("DEBUG", `${userName} send \"${event.message.text.replace(/\r\n|\n/g,"\\n")}\"`);
					var items = event.message.text.split("\n");
					if(items.indexOf("隨機選擇") !== -1){
						//隨機選擇事件
						ramdonChooseEvent(event, items, userName);
					}
					break;
				case 'sticker':
					//receive sticker process
					logMessage("DEBUG", `${userName} send a sticker`);
					break;
				default:
					// receive other message type process ...[TBD]
					logMessage("DEBUG", `${userName} send something that message type does not define`);
			}
		});
	} catch(error){
		logMessage("ERROR", error);
	}
	
  
});

bot.listen('/linewebhook', 3000, function () {
	// print the current running mode
	debugMode?logMessage("INFO",'[linebot is ready!] (Debug)'):logMessage("INFO", '[linebot is ready!]');
});

//隨機選擇事件處理
function ramdonChooseEvent(event, items, userName){
	// remove the specific item
	items = items.filter(item => item !== "隨機選擇");
	// print the all item that will be choose by ramdon
	logMessage("INFO", "偵測\"隨機選擇\"事件,選項包含: "+items);
	// check if any item lenth great than 10...
	if(items.filter(item => item.length > 10).length > 0){ 
		logMessage("ERROR", `選項大於10個字元`);
		var reqMessage = `Hi, ${userName} \n任意選項請不要超過10個字元！`;
	}else{
		var reqMessage = `Hi, ${userName} \n你的隨機選擇結果為${ramdonChoose(items)}`;
	}
	// send msg to user
	event.reply(reqMessage).then(function (data) {
		logMessage("DEBUG", `event.reply result: ${data}`);
		logMessage("INFO", `已傳送: \"${reqMessage.replace(/\r\n|\n/g,"\\n")}\",至客戶端`);
	}).catch(function (error) {
		logMessage("ERROR", error);
	});
}

// get ramdon result
function ramdonChoose(items){
	return items[getRandomInt(items.length)];
}

// get 0 < x < max ramdon number
function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

// log message process
// [TBD] write it in file...
function logMessage(logType, logMessage){
	var Timestamp = Date.now();
	switch(logType){
		case "ERROR":
			console.log("\x1b[31m",`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] ERROR: ${logMessage}`);
			break;
		case "INFO":
			console.log("\x1b[32m",	`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] INFO: ${logMessage}`);
			break;
		case "DEBUG":
			if(debugMode === 1) console.log("\x1b[34m",`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] DEBUG: ${logMessage}`);
			break;
		default:
			console.log("\x1b[31m","[`${timeInMs}`] Error: The log type does not existed");
	}
		
}