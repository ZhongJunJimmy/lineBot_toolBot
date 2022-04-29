# lineBot

## Installing & Setting
1. RUN `git clone git@github.com:ZhongJunJimmy/lineBot_toolBot.git`
2. RUN `cd lineBot_toolBot`
3. RUN `npm install`
4. Edit config.json, as following:
```
{
    "channelId": "YOUR CHANNEL ID",
    "channelSecret": "YOUR CHANNEL SECRET",
    "channelAccessToken": "YOUR CHANNEL ACCESS TOKEN"
}
```
5. Reference the official document([Building a bot](https://developers.line.biz/en/docs/messaging-api/building-bot/)) to create the linebot account, and setting webhook event. let your server can receive the message from linebot.
