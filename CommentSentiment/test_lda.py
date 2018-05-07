# Dorothy Yu, Herbert Wang, Ruoxi Yang
# Method: EM Topic Modeling
# Citation: https://www.analyticsvidhya.com/blog/2016/08/beginners-guide-to-topic-modeling-in-python/


import nltk
nltk.download('wordnet')
from nltk.corpus import stopwords 
from nltk.stem.wordnet import WordNetLemmatizer
import string
import gensim
from gensim import corpora

def clean(doc):
	stop = set(stopwords.words('english'))
	exclude = set(string.punctuation) 
	lemma = WordNetLemmatizer()
	stop_free = " ".join([i for i in doc.lower().split() if i not in stop])
	punc_free = ''.join(ch for ch in stop_free if ch not in exclude)
	normalized = " ".join(lemma.lemmatize(word) for word in punc_free.split())
	return normalized

#x: num_topics
#y: num_words
def lda(f, x, y):
	input_file = open(f, "r")
	input_data = input_file.read().replace('\n', ' ')
	doc_clean = [clean(input_data)	.split()]

	# Creating the term dictionary of our courpus, where every unique term is assigned an index. 
	dictionary = corpora.Dictionary(doc_clean)

	# Converting list of documents (corpus) into Document Term Matrix using dictionary prepared above.
	doc_term_matrix = [dictionary.doc2bow(doc) for doc in doc_clean]

	# Creating the object for LDA model using gensim library
	Lda = gensim.models.ldamodel.LdaModel

	# Running and Trainign LDA model on the document term matrix.
	ldamodel = Lda(doc_term_matrix, num_topics=x, id2word = dictionary, passes=50)

	ret = ldamodel.show_topics(num_topics=x, num_words=y, formatted=False)
	topics_words = [(tp[0], [wd[0] for wd in tp[1]]) for tp in ret]
	#print(topics_words)
	result = []
	for topic,words in topics_words:
		result.append((" ".join(words)))

		# result += (" ".join(words))
	return result
	# return ldamodel.print_topics(num_topics=x, num_words=y)
