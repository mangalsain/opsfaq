var restify = require('restify');
var builder = require('botbuilder');
var Chatbot = require('./model/chatBot.js');
//var mongoose = require('mongoose');
var Client = require('node-rest-client').Client;
var client = new Client();
var request = require('request');
var YAML = require('yamljs');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3798, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

//mongoose.connect('mongodb://127.0.0.1:27017/chatbot');

// Create chat bot
var connector = new builder.ChatConnector({
    appId: "63bf713a-ea95-495a-a285-67c0cdec5813",
    appPassword: "bPSLoYd955CDhynX6pViPq7"
    //appId: process.env.MICROSOFT_APP_ID,
    //appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
var intents = new builder.IntentDialog();

bot.dialog('/', intents);

intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

intents.onDefault([
    function (session, args, next) {
        console.log("session",session.message.attachments)
        session.beginDialog('/getOptions');
    }
]);

bot.dialog('/getOptions', [
    function (session, args, next) {
        builder.Prompts.text(session, 'Please select option 1. Update 2. Attachment 3.Input');    
    },
    function (session,results) {
        if(results.response == 1){
            session.beginDialog('/update');

        }else if(results.response == 2){
            session.beginDialog('/getAttachment')
        }else if(results.response == 3){
            session.beginDialog('/getInput')
        }else{
            session.replaceDialog('/getOptions');
            return;
        }
    }
]);
bot.dialog('/getAttachment', [
    function (session, args, next) {
        builder.Prompts.text(session, 'Please provide the json file');    
    },
    function (session,results) {
        if(session.message.attachments){
            request.get({url:session.message.attachments[0].contentUrl}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var chatInstance = new Chatbot();
                    chatInstance.userName = session.message.address.user.name;
                    chatInstance.timeStamp = new Date().getTime();
                    chatInstance.messenger = session.message.source;
                    chatInstance.messageOne = body;
                    /*chatInstance.save(function(err) {
                        if (err){
                            console.log(err)
                            return
                            //throw err;    
                        }
                        console.log("Instance saved")
                    });*/
                }
            });
        }
    }
]);

bot.dialog('/getInput', [
    function (session, args, next) {
        builder.Prompts.text(session, 'Please provide the input data');    
    },
    function (session,results) {
        try{
            console.log(results.response)
            var nativeObject = YAML.parse(results.response);
            session.send("Successfully parsed")
            session.send(YAML.stringify(nativeObject))
        }catch(ex){
            session.send("exception")
            session.send(ex)
        }
    }
]);

bot.dialog('/update', [
    function (session, args, next) {
        if(session.reAskuserResponse){
            session.reAskuserResponse = false;
            builder.Prompts.text(session, 'I am sorry, I could not understand. Do you want an upgrade recommendation? Yes/No');    
        }else{
            builder.Prompts.text(session, 'Welcome to opsfaq! Do you want an upgrade recommendation? Yes/No');    
        }
    },
    function (session,results) {
        if(results.response.toLowerCase().indexOf("yes")>-1){
            builder.Prompts.text(session, 'Provide me some  information about your docker environment. Type in whatever you want to');
            next();
        }else if(results.response.toLowerCase().indexOf("no")>-1){
            session.send('Thank you for our interaction. Ping me if you need me later');
            session.endDialog();
        }else{
            session.reAskuserResponse = true;
            session.replaceDialog('/update');
            return;
        }
    },
    function (session, results) {
        session.dialogData.updateOne = results.response;
        builder.Prompts.text(session, 'Thank you. I also need some more information. Type in some more for me please');
        next();
    },
    function(session,results){
        session.dialogData.updateTwo = results.response;
        session.send("You provided '"+session.dialogData.updateOne + " "+session.dialogData.updateTwo+ "'. I am going to find out the upgrade recommendation based on your input and will ping you soon");
        //initialize model
        var chatInstance = new Chatbot();
        chatInstance.userName = session.message.address.user.name;
        chatInstance.timeStamp = new Date().getTime();
        chatInstance.messenger = session.message.source;
        chatInstance.messageOne = session.dialogData.updateOne;
        chatInstance.messageTwo = session.dialogData.updateTwo;
        console.log(chatInstance);
        /*chatInstance.save(function(err) {
            console.log(err)
            if (err){
                console.log(err)
                return
                //throw err;    
            }
            console.log("Instance saved")
        });*/
        sendRequest(session);
        session.endDialog();
    }
]);
var sendRequest = function(session){
    var args = {
        data: { test: "hello" },
        headers: { "Content-Type": "application/json" }
    };
    client.registerMethod("jsonMethod", "http://104.197.241.157:8080/v1/upgrade", "POST");
    client.methods.jsonMethod(args, function (data, response) {
        session.send(JSON.stringify(data))
    });
}

/*var intervalfn = setInterval(function(){
    console.log("call came");
    var reply = new builder.Message().address({
     bot: "nikhilmittalsamplebot", user: "nikhilmittal", channelId: "slack", serviceUrl: "https://slack.botframework.com" 
    }) .text("Hello everyone!"); 
    bot.send(reply, function (err) { console.log(err); });
},10000);
*/
bot.dialog('/notify', function (session) {
   session.endDialog("I'm sending you a proactive message!");
});
