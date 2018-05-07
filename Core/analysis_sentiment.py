##Citiation: https://pythonprogramming.net/combine-classifier-algorithms-nltk-tutorial/?completed=/sklearn-scikit-learn-nltk-tutorial/

import training_classifier as tcl
import nltk
nltk.download('punkt')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import os.path
import pickle
from statistics import mode
from scipy import stats
from nltk.classify import ClassifierI
from nltk.metrics import BigramAssocMeasures
from nltk.collocations import BigramCollocationFinder as BCF
import itertools
from nltk.classify import NaiveBayesClassifier
from nltk.tokenize.stanford import CoreNLPTokenizer
from nltk.tag.stanford import CoreNLPPOSTagger

from sklearn.naive_bayes import MultinomialNB, BernoulliNB
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.svm import SVC, LinearSVC, NuSVC
from nltk.classify.scikitlearn import SklearnClassifier

from nltk.classify import DecisionTreeClassifier


sttok = CoreNLPTokenizer('http://127.0.0.1:9001')

def features(words):
	temp = word_tokenize(words)

	words = [temp[0]]
	for i in range(1, len(temp)):
		if(temp[i] != temp[i-1]):
			words.append(temp[i])

	scoreF = BigramAssocMeasures.chi_sq
	#bigram count
	n = 150
	bigrams = BCF.from_words(words).nbest(scoreF, n)
	return dict([word,True] for word in itertools.chain(words, bigrams))

def chinese_features(words):
	 words = sttok.tokenize(words)
	 scoreF = BigramAssocMeasures.chi_sq
	 #bigram count
	 n = 150
	 bigrams = BCF.from_words(words).nbest(scoreF, n)
	 ret = dict([word,True] for word in itertools.chain(words, bigrams))
	 #print(ret)
	 return ret

class VoteClassifier(ClassifierI):
	def __init__(self, *classifiers):
		self.__classifiers = classifiers

	def classify(self, comments):
		votes = []
		for c in self.__classifiers:
			v = c.classify(comments)
			votes.append(v)
		con = mode(votes)
		# con = stats.mode(votes)

		choice_votes = votes.count(mode(votes))
		# choice_votes = votes.count(stats.mode(votes))
		conf = (1.0 * choice_votes) / len(votes)

		return con, conf


#language 0: chinese
#language 1: english
def sentiment(comments, language):
	if language == 0 and not os.path.isfile('chinese_classifier.pickle'):
		tcl.chinese_training()
	if language == 1 and not os.path.isfile('naive_bayes.pickle'):
		tcl.training()

	if language == 1:
		fl = open('naive_bayes.pickle','rb')
	else:
		fl = open('chinese_classifier.pickle','rb')

	naive_bayes_classifier = pickle.load(fl)
	fl.close()

	pos = 0
	neg = 0
	count = 0
	for words in comments:
		count += 1
		if language == 1:
			comment = features(words)
		else:
			comment = chinese_features(words)
		voted_classifier = VoteClassifier(naive_bayes_classifier)


		sentiment_value, confidence = voted_classifier.classify(comment)
		#if count <= 20:
			#print(count, sentiment_value, confidence)
		if sentiment_value == 'positive':# and confidence * 100 >= 60:
			pos += 1
		else:
			neg += 1

	output = []
	output.append("Positive sentiment : " + str(int(pos * 100.0 /len(comments))))
	output.append("Negative sentiment : " + str(int(neg * 100.0 /len(comments))))
	return output
	#print ("Positive sentiment : ", (pos * 100.0 /len(comments)) )
	#print ("Negative sentiment : ", (neg * 100.0 /len(comments)) )
