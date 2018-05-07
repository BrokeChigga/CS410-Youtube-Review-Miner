import matplotlib
matplotlib.use('Agg')
import comment_extract as CE
import sentimentYouTube as SYT
import test_lda as TL
import sklearn_similarity as SS

def main():
	# videoId = input("Enter VideoId : ")
	videoId = 'JIIiOa0wjdE'
	# Fetch the number of comments
	# if count = -1, fetch all comments

	# count = int(input("Enter no. of comments to extract : "))
	comment_list = CE.commentExtract(videoId, 30)
	print(SYT.sentiment(comment_list, 0))
	# print(TL.lda("sample_comment.txt",5, 10))


if __name__ == '__main__':
	main()
