#!/usr/bin/nodejs
function perent(i){
	return Math.floor(i/2);
}
function right(i){
	return i*2;
}
function left(i){
	return (i*2) + 1;
}
function pop(array){
	last = array[array.length-1];
	ret  = array[1];
	array.pop();
	if (array.length > 1){
		array[1] = last;
		heapfiy(array ,1);
	}
	return ret;
}
function swap(array, i, j){
	var temp = array[i];
	array[i] = array[j];
	array[j] = temp;
}
function insert(array, x){
	array.push(x);
	var i = array.length-1;

	while (perent(i) > 0  && array[i] < array[perent(i)])
	{
		swap(array , i , perent(i));
		i = perent(i);
	}
}
function heapfiy(array, i){
	var j = i;
	var r = right(i);
	j = r < array.length && array[r] < array[j] ? r : j;
	var l = left(i);
	j = l < array.length && array[l] < array[j] ? l : j;
	if (i != j){
		swap(array, i, j);
		heapfiy(array, j);
	}
}
function heapsort(array){
	arrayHeap = [-1 , array[0]];
	for (var i = 1 ; i < array.length ; i++){
		insert(arrayHeap , array[i]);
	}
	sortedarray = [];
	var index = 0;
	while (arrayHeap.length > 1){
		sortedarray[index] = pop(arrayHeap);
		index++;
	}
	return sortedarray;
}
function write_log(data){
	data = ">>> "  + data +"\n";
	var path = './data/log.inc';
	fs = require('fs');
	fs.appendFile(path, data ,function (error) {
		if (error) return console.log(error);
	});
}
function server_init(){
	var path = './data/log.inc';
	var suffix ="<html>\n"+
								"<head>\n"+
								"<script>\n"+
								"function reset_data () {\n"+
									"var xmlhttp = new XMLHttpRequest();\n"+
									"xmlhttp.open('GET','http://localhost:8000/update', true);\n"+
									"xmlhttp.onreadystatechange=function(){\n"+
										"if (xmlhttp.readyState==4 && xmlhttp.status==200){\n"+
											"var updatedata = xmlhttp.responseText;\n"+
											"document.getElementById('datalist').innerHTML = updatedata;\n"+ 
										"}\n"+
									"}\n"+
									"xmlhttp.send();\n"+
								"}\n"+
								"setInterval(reset_data , 500);\n"+
								"</script>\n"+
									"<title>\n</title>\n" +
								"</head>\n"+
								"<body>\n"+
								"<div style='position:absolute; font-family:consolas;'>\n" +
									"<pre id='datalist' style='font-family:consolas;width:40%;float:left;font-size:12px'>\n"
	var preffix = "</pre>\n</div>\n</body>\n</html>"
	var http  = require("http"); 
	var fs 	  = require('fs');
	var url	  = require('url');
	var content = "";
	fs.watchFile(path , function (curr, prev) {
		fs.readFile(path , function(error , htmlcontent){
			if(!error){
				content = htmlcontent;
			}
		});
	});
	http.createServer(function(request, response) {
		response.writeHead(200, {"Content-Type": "text/html"});
		var page;
		if (url.parse(request.url).pathname == "/update"){
			page = content;
		}
		else{
			page = suffix + content + preffix;
		}
		response.write(page);
		response.end();
 	}).listen(8000);
}

/------------- Main ------------------/

var amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost' , function(error , connection) {
	if (connection){
		connection.createChannel(function(error , channel) {
			var queuename = 'sendinput';
			var sortedarray;

			channel.assertQueue(queuename , {durable : false});
			console.log(" [*] Waiting for messages");
			channel.consume(queuename , function(msg){
				
				var array = [];
				var numbers = msg.content.toString().split(' ');
				for(var i = 0; i < numbers.length; i++){
					array.push(parseInt(numbers[i]));
				}
				sortedarray = heapsort(array);
				if (sortedarray){
					write_log(msg.properties.replyTo + " : " + array);
					write_log(msg.properties.replyTo + " : " + sortedarray);	
					channel.sendToQueue(msg.properties.replyTo,
					 new Buffer(sortedarray.toString()), {persistent: true ,
					 	correlationId: msg.properties.correlationId});
				}
			} , {noAck: true});
		});
	}
	else{
		console.log(error);
	}
});
server_init();