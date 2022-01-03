var linebot = require('linebot');
var moment = require('moment');
const fs = require('fs');

let rawdata = fs.readFileSync('./config.json');
let config = JSON.parse(rawdata);

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
	event.source.profile().then(function (profile) {
		var userName = profile.displayName;
		logMessage("DEBUG", `${userName}說\"${event.message.text.replace(/\r\n|\n/g,"\\n")}\"`);
		var items = event.message.text.split("\n");
		if(items.indexOf("隨機選擇") !== -1){
			//隨機選擇事件
			ramdonChooseEvent(event, items, userName);
		}
	});
  
});

bot.listen('/linewebhook', 3000, function () {
	debugMode?console.log('[linebot is ready!] (Debug)'):console.log('[linebot is ready!]');
    
});

//隨機選擇事件處理
function ramdonChooseEvent(event, items, userName){
	items = items.filter(item => item !== "隨機選擇");
	logMessage("INFO", "偵測\"隨機選擇\"事件,選項包含: "+items);
	if(items.filter(item => item.length > 10).length > 0){
		logMessage("ERROR", `選項大於10個字元`);
		var reqMessage = `Hi, ${userName} \n任意選項請不要超過10個字元！`;
	}else{
		var reqMessage = `Hi, ${userName} \n你的隨機選擇結果為${ramdonChoose(items)}`;
	}
	
	event.reply(reqMessage).then(function (data) {
		logMessage("INFO", `已傳送: \"${reqMessage.replace(/\r\n|\n/g,"\\n")}\",至客戶端`);
	}).catch(function (error) {
		logMessage("ERROR", error);
	});
}

//隨機選擇結果
function ramdonChoose(items){
	return items[getRandomInt(items.length)];
}

//取得0 < x < max的隨機數
function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

//log訊息處理函式
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