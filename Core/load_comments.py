# @Dorothy Yu, @Herbert Yang, @Ruoxi Yang
# Fetch comments from a youtube page
# Method: send request through the protocol
# Citation: https://github.com/sachin-bisht/YouTube-Sentiment-Analysis

import lxml
import requests
import time
import sys

YOUTUBE_IN_LINK = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&order=relevance&pageToken={pageToken}&videoId={videoId}&key={key}'
YOUTUBE_LINK = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&order=relevance&videoId={videoId}&key={key}'
key = 'AIzaSyAqTZncPWBW7l9TwwKuTOuKH_ur33y8jRs'
	
def commentExtract(videoId, count = -1): #Default: extract all comments
	#Start download comments
	get_page = requests.get(YOUTUBE_LINK.format(videoId = videoId, key = key))
	while get_page.status_code != 200:
		if get_page.status_code != 429:
			print ("Comments are disabled due to invalid page.")
			sys.exit()

		time.sleep(15)
		get_page = requests.get(YOUTUBE_LINK.format(videoId = videoId, key = key))

	#Turn the obtained page information into a json file
	page_info = get_page.json()

	comments = []
	extract_cnt = 0;
	for i in range(0,len(page_info['items'])):
		comments.append(page_info['items'][i]['snippet']['topLevelComment']['snippet']['textOriginal'])
		extract_cnt += 1
		if extract_cnt == count:
			return comments

	while 'nextPageToken' in page_info:
		temp = page_info
		page_info = requests.get(YOUTUBE_IN_LINK.format(videoId = videoId, key = key, pageToken = page_info['nextPageToken']))

		while page_info.status_code != 200:
			time.sleep(1)
			page_info = requests.get(YOUTUBE_IN_LINK.format(videoId = videoId, key = key, pageToken = temp['nextPageToken']))
		page_info = page_info.json()

		for i in range(0,len(page_info['items'])):
			comments.append(page_info['items'][i]['snippet']['topLevelComment']['snippet']['textOriginal'])
			extract_cnt += 1
			if extract_cnt == count:
				return comments
	return comments
