#@Dorothy Yu, @Herbert Wang, @Ruoxi Yang
#Generate keyword graph using WordCloud
#Citation: https://github.com/sachin-bisht/YouTube-Sentiment-Analysis 

import string
import nltk
nltk.download('stopwords')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from wordcloud import WordCloud
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64


def fancySentiment(comments):
	stopword = set(stopwords.words('english') + list(string.punctuation) + ['n\'t'])

	#Filter through comments to remove stopwords
	comments_wo_sw = []

	for i in comments:
		words = word_tokenize(i)
		current_comment = ""
		for w in words:
			if w not in stopword:
				current_comment += str(w)
				current_comment += ' '
		comments_wo_sw.append(current_comment)

	comments_to_str = ' '.join(comments_wo_sw) 

	#Use WorkCloud website to generate a picture of key words
	keywords = WordCloud(background_color = '#f4f442', max_words=150)
	keywords.generate(comments_to_str)

	#Plot the picture of key words
	plt.figure()
	plt.imshow(keywords)
	plt.axis("off")
	plt.savefig('keywords_fig')

	#Encode generated image
	with open("keywords_fig.png", "rb") as image_file:
		encoded_string = base64.b64encode(image_file.read())
		return encoded_string
