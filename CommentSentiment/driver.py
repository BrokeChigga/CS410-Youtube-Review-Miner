import matplotlib
matplotlib.use('Agg')
import comment_extract as CE
import sentimentYouTube as SYT

def main():
	# EXAMPLE VideoId = 'tCXGJQYZ9JA'
	videoId = input("Enter VideoId : ")
	# videoId = 'tCXGJQYZ9JA'
	# Fetch the number of comments
	# if count = -1, fetch all comments
	count = int(input("Enter no. of comments to extract : "))
	comments = CE.commentExtract(videoId, count)
	# print(comments)
	SYT.sentiment(comments)


if __name__ == '__main__':
	main()
