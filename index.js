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

let allData = {};

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

function sendSpecificMessage(messageData, sender) {
	console.log("SPECIFIC TEXT MESSAGE");
	
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
		let sender = event.sender.id
		if (event.message && event.message.text) {
			console.log(event);
			if (event.postback) {
				let text = JSON.stringify(event.postback)
				sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
				continue
			}

			//Payload wale messages
			if(event.message.quick_reply && event.message.quick_reply.payload) {
				let text = event.message.quick_reply.payload
				if(text == "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_BMI") {
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
				}
				sendTextMessage(sender, "HALA MADRID: " + text.substring(0, 200))
				continue
			}
			let text = event.message.text
			if (text === 'Hi' || text === 'hi') {
				sendGenericMessage(sender)
				continue
			}
			sendTextMessage(sender, "Sorry I'm still learning")
		}
	}
	res.sendStatus(200)
})

const token = "EAAPJ21Aq3hMBADX7qdNP1M0sKqxigQBPgD68C0eDq9gNcOnqEsw8E61wWk0R9HLj58o9DFGrTpZBT5rBUVQTPAof9TIsBCJhOEe9Y5RTq2sZClx5noXPif1ZAYb6cZCXWxhyk0OpHcwZBMjIlHDkHqFHDpNXFakgWkQZB6yN9MIwZDZD"

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
