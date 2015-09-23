#!/usr/bin/python3

if __name__ == "__main__":
	inputpath = "./data/log.txt"
	outpath 	= "./data/bluk.json" 
	fileds = ["queue-name" , "message" ]
	ignore = [">>>" , ":"]
	content = "" 
	for line in open(inputpath , 'r'):
		j = 0
		content += "{\"index\":{\"_index\":\"queue-monitor\",\"_type\":\"packet\"}}\n"
		content += "{"
		for word in line.split():
			if word not in ignore:
				if j > 0:
					content += ","
				content += "\"" + fileds[j] + "\" : \"" + word + "\""  
				j += 1
		content += "}\n"
	open(outpath   , 'a').write(content)
