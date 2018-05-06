# Feature extraction from text
# Method: bag of words
# Citation: https://pythonprogramminglanguage.com

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import euclidean_distances
import numpy as np

INITIAL_OPTIMAL_SCORE = 1000000

def score_array(base_comment_str, comment_list, num_opt_scores):
    """
    Return a list of most k (num_opt_scores) similar comments in the comment_list with respect to base_comment_str.
    """
    if num_opt_scores > len(comment_list):
        print("Please enter a valid number. (A possibly a smaller number would be better)\n")
        exit(1)

    vectorizer = CountVectorizer()
    features = vectorizer.fit_transform(comment_list).todense()
    base_feature = vectorizer.fit_transform(base_comment_str).todense()
    print("Vocabulary is: \n", vectorizer.vocabulary_)

    scores = []
    optimal_score = INITIAL_OPTIMAL_SCORE

    for f in features:
        score = euclidean_distances(base_feature, f)
        score = np.reshape(score, (1,))
        score = score[0]
        scores.append(score)

    scores = np.array(scores)
    optimal_idx_arr = scores.argsort()[:num_opt_scores]
    optimal_score_arr = []

    for idx in optimal_idx_arr:
        optimal_score_arr.append(comment_list[idx])
    optimal_score_arr = np.array(optimal_score_arr)

    return optimal_score_arr
