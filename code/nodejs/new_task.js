#!/usr/bin/nodejs
var n = 10;
msg = (Math.floor(Math.random()*n*100)).toString()
for (var i = 0; i < n; i++){
	msg += " " +(Math.floor(Math.random()*n*100)).toString();
}
var amqp = require('amqplib/callback_api');
var secs = 3;
amqp.connect('amqp://localhost' , function(error , connection) {
	connection.createChannel(function(error ,channel) {
		var queuename = 'sendinput';
		channel.assertQueue(queuename , {durable: false});
		channel.assertQueue('', {exclusive: true},
			function(error , queue){
			 	channel.sendToQueue(queuename , new Buffer(msg) 
				,{persistent: false , replyTo: queue.queue});
				channel.consume(queue.queue , function(sortedarray){
					console.log(queue.queue + " : " + sortedarray.content.toString());
			} , {noAck: true});
		});
	});
});
