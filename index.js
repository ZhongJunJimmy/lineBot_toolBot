var linebot = require('linebot');
var moment = require('moment');
var handle = require('./handle')
var fs = require('fs');
var tw = require('taiwan-weather');

var Timestamp = Date.now();
//read config file
let config = JSON.parse(fs.readFileSync('./config.json'));
//read message file
let messageJson = JSON.parse(fs.readFileSync('./message.json'));

const logPath = "./log";
const logFileName = `LS_${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}.log`;

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
  const citys = [	"CHANGHUA_COUNTY","CHIAYI_CITY","CHIAYI_COUNTY","HSINCHU_CITY",
				  "HSINCHU_COUNTY","HUALIEN_COUNTY","KAOHSIUNG_CITY","KEELUNG_CITY",
				  "KINMEN_AREA","MATSU_AREA","MIAOLI_COUNTY","NANTOU_COUNTY",
				  "NEW_TAIPEI_CITY","PENGHU_COUNTY","PINGTUNG_COUNTY","TAICHUNG_CITY",
				  "TAINAN_CITY","TAIPEI_CITY","TAITUNG_COUNTY","TAOYUAN_CITY","YILAN_COUNTY",
				  "YUNLIN_COUNTY"];


bot.on("postback", function (event){
	console.log(event);
})




// message event trigger
bot.on('message', function (event) {
	try{
		event.source.profile().then(function (profile) {
			var userName = profile.displayName;
			logMessage("DEBUG", `event: ${JSON.stringify(event)}`);
			logMessage("DEBUG", `event.source.profile: ${JSON.stringify(profile)}`);
			switch(event.message.type){
				case 'text':
					//receive text process
					logMessage("DEBUG", `${userName} send \"${event.message.text.replace(/\r\n|\n/g,"\\n")}\"`);
					
					if(event.message.text.indexOf("隨機選擇") !== -1){
						//隨機選擇事件
						ramdonChooseEvent(event, userName);
					}else if(event.message.text.indexOf("button") !== -1){
						//let twFileName = `${userName}_${Timestamp}_`;
						logMessage("DEBUG", `${JSON.stringify(buttonTest())}`);
						event.reply(buttonTest()).then(function (data) {
							logMessage("INFO", `data: \"${JSON.stringify(data)}\"`);
						}).catch(function (error) {
							logMessage("ERROR", error);
						});
						// get weather msg
						/*tw.get(
							config.twKey,
							{
								loc: tw.DataEnum.Loc[citys[17]],
								freq: tw.DataEnum.Freq.H72,
								lang: tw.DataEnum.Lang.ZH,
								output: 'data',
								prefix: twFileName,
								toJson: true
							},
							err => {
								if (err) {
									logMessage("ERROR", err);
								}else{
									let twData = JSON.parse(fs.readFileSync(`./data/${twFileName}63_72hr_CH.json`));
									var locDescription = [];
									twData.cwbopendata.dataset[0].locations[0].location.map((element)=>{
										locDescription.push({
											locationName: element.locationName[0],
											weatherDescription: element.weatherElement[10].time[0].elementValue[0].value[0].replace(/。/g,"\n")
										})
									});

									fs.unlinkSync(`./data/${twFileName}63_72hr_CH.json`);
									fs.unlinkSync(`./data/${twFileName}63_72hr_CH.xml`);

									logMessage("DEBUG", JSON.stringify(locDescription));
									event.reply(locDescription).then(function (data) {
										logMessage("INFO", `已傳送: \"\",至客戶端`);
									}).catch(function (error) {
										logMessage("ERROR", error);
									});
								}
							}
						);*/
					}
					break;
				case 'sticker':
					//receive sticker process
					logMessage("DEBUG", `${userName} send a sticker`);
					break;
				case 'image':
					//receive sticker process
					logMessage("DEBUG", `${userName} send a image`);
					break;
				case 'video':
					//receive sticker process
					logMessage("DEBUG", `${userName} send a video`);
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

function buttonTest(){
	var actions = [{
		"type": "postback",
		"label": "button1",
		"data": "action=button1"
	  },
	  {
		"type": "postback",
		"label": "button2",
		"data": "action=button2"
	  },
	  {
		"type": "postback",
		"label": "button3",
		"data": "action=button3"
	  },
	  {
		  "type": "postback",
		  "label": "button4",
		  "data": "action=button4"
	  }];
	return handle.buttonHandle("測試", "請按按鈕", actions);
}

//隨機選擇事件處理
function ramdonChooseEvent(event, userName){
	var items = event.message.text.split("\n");
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
function logMessage(logType, logMessage){
	switch(logType){
		case "ERROR":
			writeLogFile(`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] ERROR: ${logMessage}\n`);
			console.log("\x1b[31m",`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] ERROR: ${logMessage}`);
			break;
		case "INFO":
			writeLogFile(`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] INFO: ${logMessage}\n`);
			console.log("\x1b[32m",	`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] INFO: ${logMessage}`);
			break;
		case "DEBUG":
			writeLogFile(`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] DEBUG: ${logMessage}\n`);
			if(debugMode === 1) console.log("\x1b[34m",`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] DEBUG: ${logMessage}`);
			break;
		default:
			writeLogFile(`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] Error: The log type does not existed\n`);
			console.log("\x1b[31m",`[${moment(Timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS')}] Error: The log type does not existed`);
	}
		
}
// write log msg into log file
function writeLogFile(msg){	
	if(!fs.existsSync(logPath))
		fs.mkdirSync(logPath);
	fs.appendFile(logPath+"/"+logFileName, msg, function (err) {
		if (err) console.log(err);
	});
}