#!/bin/bash

curl -X POST --data-binary @- localhost:9200/queue-monitor << EOF
{
	"packet" : {
	}
}
EOF