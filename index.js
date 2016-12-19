'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

let allData = [];
var lastAnswered = '';

//This function is for sending What you want to do question
function sendGenericMessage(sender) {
	let messageData = {
		"text":"Hi... I'm a bot... What do you want to do?",
		"quick_replies":[
			{
				"content_type":"text",
				"title":"BMI",
				"payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_BMI"
			},
			{
				"content_type":"text",
				"title":"Diabetes Risk",
				"payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DBR"
			}
		]
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// A more generic version of quick message sending format
function sendSpecificMessage(messageData, sender) {
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// Application is running at either heroku's port or 5000
app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]

		//This is the sender ID
		let sender = event.sender.id
		if (event.message && event.message.text) {

			/// Postback part
			if (event.postback) {
				let text = JSON.stringify(event.postback)
				sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
				continue
			}

			//Payload wale messages
			if(event.message.quick_reply && event.message.quick_reply.payload) {
				let text = event.message.quick_reply.payload

				// BMI Wala question
				if(text == "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_BMI") {
					allData[sender] = {
						"gender": '',
						"height": 0,
						"weight": 0
					}
					console.log("BLANK DATA");
					console.log(allData);
					console.log(sender);
					console.log(allData[sender]);
					let messageData1 = {
						"text":"I know it's a little bit awkward, but may I know your gender. I will need it to proceed with my calculations",
						"quick_replies":[
							{
								"content_type":"text",
								"title":"MALE",
								"payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_MALE"
							},
							{
								"content_type":"text",
								"title":"FEMALE",
								"payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_FEMALE"
							}
						]
					}
					sendSpecificMessage(messageData1, sender)
					continue
				} else if(text == "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_MALE") {
					allData[sender]["gender"] = "male";
					console.log("MALE DATA");
					console.log(allData);
					console.log(sender);
					console.log(allData[sender]);
					sendTextMessage(sender, "Hello Mister!!! Its pleasure to meet you. May I know your height?")
					lastAnswered = "Gender";
					continue
				} else if(text == "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_FEMALE") {
					allData[sender]["gender"] = "female";
					console.log("FEMALE DATA");
					console.log(allData);
					console.log(sender);
					console.log(allData[sender]);
					sendTextMessage(sender, "Hi Beautiful!!! Its pleasure to meet you. May I know your height?")
					lastAnswered = "Gender";
					continue
				}
				sendTextMessage(sender, "HALA MADRID: " + text.substring(0, 200))
				continue
			}
			let text = event.message.text
			if (text === 'Hi' || text === 'hi') {
				// Lets get it started
				sendGenericMessage(sender)
				continue
			} else if(lastAnswered == "Gender") {
				if(parseInt(text) == parseInt(text)) {
					allData[sender]["height"] = parseInt(text);
					console.log("HEIGHT DATA");
					console.log(allData);
					console.log(sender);
					console.log(allData[sender]);
					sendTextMessage(sender, "Thanks for the response. May I know your weight.. Please enter your weight");
					lastAnswered = "Height";
				}
				else {
					sendTextMessage(sender, "I'm a very young bot. Not able to understand what you mean. Please enter your Height once again");
					lastAnswered = "Gender";
				}
			} else if(lastAnswered == "Height") {
				if(parseInt(text) == parseInt(text)) {
					allData[sender]["weight"] = parseInt(text);
					console.log("WEIGHT DATA");
					console.log(allData);
					console.log(sender);
					console.log(allData[sender]);
					sendTextMessage(sender, "That's it.... Here is your bmi result");
					lastAnswered = "Done";
				}
				else {
					sendTextMessage(sender, "I'm a very young bot. Not able to understand what you mean. Please enter your Weight once again");
					lastAnswered = "Height";
				}
			} else {
				sendTextMessage(sender, "Sorry I'm still learning")
			}
		}
	}
	res.sendStatus(200)
})

const token = "EAAPJ21Aq3hMBADX7qdNP1M0sKqxigQBPgD68C0eDq9gNcOnqEsw8E61wWk0R9HLj58o9DFGrTpZBT5rBUVQTPAof9TIsBCJhOEe9Y5RTq2sZClx5noXPif1ZAYb6cZCXWxhyk0OpHcwZBMjIlHDkHqFHDpNXFakgWkQZB6yN9MIwZDZD"

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
