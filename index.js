// 引用linebot SDK
var linebot = require('linebot');

// 用於辨識Line Channel的資訊
var bot = linebot({
  channelId: '1656768637',
  channelSecret: 'a9d199f4de51b79863570da214b058f4',
  channelAccessToken: 'AnnoYMlRarvafN6Eg65Ai1c3+FZzWAXXHUC+RRBHPCKmNg5kEQA4OoOKU1rpovnwbtY8RShDht22BG9rNnJnPOiLZy8tIFOoiHe3RYBRP764hVeT2/W/re4xr5ojlWirmUpsbC2FnA3xtde5TfOCyAdB04t89/1O/w1cDnyilFU='
});

// 當有人傳送訊息給Bot時
bot.on('message', function (event) {
  // event.message.text是使用者傳給bot的訊息
  console.log(event.message.text);
  var items = event.message.text.split("\n");
  console.log(items);
  console.log("length: "+items.length);
  console.log("----------------");
  // 使用event.reply(要回傳的訊息)方法可將訊息回傳給使用者
  event.reply(event.message.text).then(function (data) {
    // 當訊息成功回傳後的處理
  }).catch(function (error) {
    // 當訊息回傳失敗後的處理
  });
});

// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook', 3000, function () {
    console.log('[BOT已準備就緒]');
    console.log("----------------");
});

const rendomChoose=(items)=>({

});