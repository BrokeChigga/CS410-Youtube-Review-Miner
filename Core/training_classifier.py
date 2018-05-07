##Citation: https://pythonprogramming.net/combine-classifier-algorithms-nltk-tutorial/?completed=/sklearn-scikit-learn-nltk-tutorial/

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk.classify.util as util
from nltk.classify import NaiveBayesClassifier
from nltk.metrics import BigramAssocMeasures
from nltk.collocations import BigramCollocationFinder as BCF
import itertools
import pickle
from nltk.tokenize.stanford import CoreNLPTokenizer
from nltk.tag.stanford import CoreNLPPOSTagger


sttok = CoreNLPTokenizer('http://127.0.0.1:9001')

def features(words):
	words = word_tokenize(words)
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
	 return ret

def chinese_training():
	pos_sen = open("chinese_positive.txt", 'r', encoding = 'utf-8').read()
	neg_sen = open("chinese_negative.txt", 'r', encoding = 'utf-8').read()

	emoji = open("emoji.txt",'r', encoding = 'latin-1').read()
	pos_emoji = []
	neg_emoji = []
	for i in emoji.split('\n'):
		exp = ''
		if i[len(i)-2] == '-':
			for j in range(len(i) - 2):
				exp += i[j]
			neg_emoji.append(( {exp : True}, 'negative'))
		else:
			for j in range(len(i)-1):
				exp += i[j]
			pos_emoji.append(( {exp : True}, 'positive'))

	prev = [(chinese_features(words), 'positive') for words in pos_sen.split('\n')]
	nrev = [(chinese_features(words), 'negative') for words in neg_sen.split('\n')]

	pos_set = prev + pos_emoji
	neg_set = nrev + neg_emoji

	real_classifier = NaiveBayesClassifier.train(prev+nrev)

	# SAVE IN FILE TO AVOID TRAIINING THE DATA AGAIN
	save_doc = open("chinese_classifier.pickle", 'wb')
	pickle.dump(real_classifier, save_doc)
	save_doc.close()


def training():
	pos_sen = open("positive.txt", 'r', encoding = 'latin-1').read()
	neg_sen = open("negative.txt", 'r', encoding = 'latin-1').read()

	emoji = open("emoji.txt",'r', encoding = 'latin-1').read()
	pos_emoji = []
	neg_emoji = []
	for i in emoji.split('\n'):
		exp = ''
		if i[len(i)-2] == '-':
			for j in range(len(i) - 2):
				exp += i[j]
			neg_emoji.append(( {exp : True}, 'negative'))
		else:
			for j in range(len(i)-1):
				exp += i[j]
			pos_emoji.append(( {exp : True}, 'positive'))

	prev = [(features(words), 'positive') for words in pos_sen.split('\n')]
	nrev = [(features(words), 'negative') for words in neg_sen.split('\n')]

	pos_set = prev + pos_emoji
	neg_set = nrev + neg_emoji

	naive_bayes_classifier = NaiveBayesClassifier.train(prev+nrev)

	# SAVE IN FILE TO AVOID TRAIINING THE DATA AGAIN
	save_doc = open("naive_bayes.pickle", 'wb')
	pickle.dump(naive_bayes_classifier, save_doc)
	save_doc.close()
