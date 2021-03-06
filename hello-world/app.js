// Copyright 2015-2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

var Client = require('node-rest-client').Client;
var client = new Client();

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 8080;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// test route
app.get('/', function (req, res) { res.status(200).send('Hello slackbot!'); });

app.listen(port, function () {
  console.log('Listening on port ' + port);
});

app.post('/simple', function (req, res, next) {
  var userName = req.body.user_name;

  var botPayload = {
    text : 'Hello ' + userName + ', Simple test'
  };

  // Loop otherwise..
  if (userName !== 'slackbot') {
	return res.status(200).json(botPayload);
  }else {
	return res.status(200).end();
  }

});

app.get('/simpleget', function (req, res, next) {
  var userName = req.query.user_name;

  var botPayload = {
    text : 'Hello ' + userName + ', Simple test with get'
  };

  // Loop otherwise..
 	   if (userName !== 'slackbot') {
 	     return res.status(200).json(botPayload);
 	   } else {
 	     return res.status(200).end();
  	 }

});


app.post('/hello', function (req, res, next) {
  var userName = req.body.user_name;


	// set content-type header and data as json in args parameter
	var args = {
	data: { intent: "upgrade" },
	headers: { "Content-Type": "application/json" }
	};

 // registering remote methods
 client.registerMethod("jsonMethod", "http://104.197.241.157:8080/v1/upgrade", "POST");

 client.methods.jsonMethod(args, function (data, response) {
     // parsed response body as js object


     console.log(JSON.stringify(data));
     // raw response
     //console.log(response);
     // Loop otherwise..
     var botPayload = {
	     text : JSON.stringify(data)
     };
	   if (userName !== 'slackbot') {
	     return res.status(200).json(botPayload);
	   } else {
	     return res.status(200).end();
  	 }
  });



});

app.get('/helloquery', function (req, res, next) {
  var userName = req.query.user_name;


	// set content-type header and data as json in args parameter
	var args = {
	data: { intent: "upgrade" },
	headers: { "Content-Type": "application/json" }
	};

   // registering remote methods
   client.registerMethod("jsonMethod", "http://104.197.241.157:8080/v1/upgrade", "POST");

   client.methods.jsonMethod(args, function (data, response) {
       // parsed response body as js object
        console.log(JSON.stringify(data));
       // raw response
       //console.log(response);
       // Loop otherwise..
       var botPayload = {
	      text : JSON.stringify(data)
       };
  	   if (userName !== 'slackbot') {
  	     return res.status(200).json(botPayload);
  	   } else {
  	     return res.status(200).end();
    	 }
  });


});

app.post('/helloold', function (req, res, next) {
  var userName = req.body.user_name;



 // registering remote methods
 client.registerMethod("jsonMethod", "https://opsbotrestful.herokuapp.com/contacts", "GET");

 client.methods.jsonMethod(function (data, response) {
     // parsed response body as js object


     console.log(JSON.stringify(data));
     // raw response
     //console.log(response);
     // Loop otherwise..
     var botPayload = {
	     text : JSON.stringify(data)
     };
	   if (userName !== 'slackbot') {
	     return res.status(200).json(botPayload);
	   } else {
	     return res.status(200).end();
  	 }
  });



});

app.get('/helloqueryold', function (req, res, next) {
  var userName = req.query.user_name;


   // registering remote methods
   client.registerMethod("jsonMethod", "https://opsbotrestful.herokuapp.com/contacts", "GET");

   client.methods.jsonMethod(function (data, response) {
       // parsed response body as js object
        console.log(JSON.stringify(data));
       // raw response
       //console.log(response);
       // Loop otherwise..
       var botPayload = {
	      text : JSON.stringify(data)
       };
  	   if (userName !== 'slackbot') {
  	     return res.status(200).json(botPayload);
  	   } else {
  	     return res.status(200).end();
    	 }
  });


});