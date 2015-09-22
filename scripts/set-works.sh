#!/bin/bash
./code/nodejs/worker.js &
for i in `seq 0 100`
do
	./code/nodejs/new_task.js &
	sleep 1s
done

