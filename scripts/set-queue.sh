#!/bin/bash
ps aux | grep nodejs | while read line ; do
	id=$(echo $line | awk '{print $2}')
	sudo kill $id
done  
sudo rabbitmqctl stop
sudo rabbitmqctl force_reset
sudo rabbitmq-server &
            


