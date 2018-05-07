# Dorothy Yu, Herbert Wang, Ruoxi Yang
# Feature extraction from text
# Method: bag of words
# Citation: https://pythonprogramminglanguage.com

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import euclidean_distances
import numpy as np

INITIAL_OPTIMAL_SCORE = 1000000

def score_array(base_comment, comment_list, num_opt_scores):
    """
    Return a list of most k (num_opt_scores) similar comments in the comment_list with respect to base_comment_str.
    """

    # print("base_comment: \n", base_comment)
    # print("comment_list: \n", comment_list[0])

    vectorizer = CountVectorizer()
    features = vectorizer.fit_transform(comment_list).todense()
    # print("Vocabulary is: \n", vectorizer.vocabulary_)

    scores = []
    optimal_score = INITIAL_OPTIMAL_SCORE

    for f in features:
        score = euclidean_distances(features[0], f)
        score = np.reshape(score, (1,))
        score = score[0]
        scores.append(score)

    scores = np.array(scores)
    optimal_idx_arr = scores.argsort()[:num_opt_scores+1]
    optimal_arr = []

    for idx in optimal_idx_arr:
        optimal_arr.append(comment_list[idx])
    optimal_arr = np.array(optimal_arr)

    return optimal_arr[1:]
